import { GameHeaderStats } from "@/components/economy/GameHeaderStats";
import { RoomStoreCard } from "@/components/store/RoomStoreCard";
import { CAT_ROOM_IDS, type CatRoomId } from "@/constants/cat-rooms";
import { GameColors } from "@/constants/game";
import { useGame } from "@/contexts/GameProvider";
import type { RoomPurchaseResult } from "@/types/store";
import {
  getRoomStorePrice,
  isRoomUnlocked,
} from "@/utils/room-store";
import { moderateScale } from "@/utils/scale";
import * as Haptics from "expo-haptics";
import { Redirect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function triggerHaptic() {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export default function StoreScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    isReady,
    hasCompletedOnboarding,
    pet,
    wallet,
    progress,
    purchaseRoom,
    equipRoom,
    recordInteraction,
  } = useGame();

  const unlockedRooms = progress.roomsUnlocked as CatRoomId[];
  const equippedRoomId = pet.roomId as CatRoomId | undefined;
  const [feedback, setFeedback] = useState<string | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const showFeedback = useCallback((text: string) => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setFeedback(text);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null);
      feedbackTimerRef.current = null;
    }, 2600);
  }, []);

  const handleBack = useCallback(() => {
    recordInteraction();
    triggerHaptic();
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  }, [recordInteraction, router]);

  const showPurchaseMessage = useCallback(
    (result: RoomPurchaseResult, roomId: CatRoomId) => {
      const roomNumber = Number.parseInt(roomId.replace("room", ""), 10);
      switch (result) {
        case "purchased":
          return t("store.purchased", { number: roomNumber });
        case "already_owned":
          return t("store.alreadyOwned");
        case "insufficient_funds": {
          const price = getRoomStorePrice(roomId);
          const cost = price.kind === "coins" ? price.amount : 0;
          return t("store.needCoins", { cost });
        }
        default:
          return t("store.unavailable");
      }
    },
    [t],
  );

  const handleBuy = useCallback(
    (roomId: CatRoomId) => {
      recordInteraction();
      triggerHaptic();
      const result = purchaseRoom(roomId);
      if (result === "purchased") {
        triggerHaptic();
      }
      if (result !== "already_owned") {
        showFeedback(showPurchaseMessage(result, roomId));
      }
    },
    [purchaseRoom, recordInteraction, showFeedback, showPurchaseMessage],
  );

  const handleEquip = useCallback(
    (roomId: CatRoomId) => {
      recordInteraction();
      triggerHaptic();
      equipRoom(roomId);
    },
    [equipRoom, recordInteraction],
  );

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={GameColors.primary} />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding/name-pet" />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel={t("common.back")}
          >
            <Text style={styles.backText}>{t("common.back")}</Text>
          </Pressable>
          <GameHeaderStats
            coins={wallet.coins}
            streak={progress.streak}
            lives={progress.lives}
          />
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{t("store.title")}</Text>
          <Text style={styles.subtitle}>{t("store.subtitle")}</Text>
          {feedback ? (
            <View style={styles.feedbackBanner}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          ) : null}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {CAT_ROOM_IDS.map((roomId) => {
            const price = getRoomStorePrice(roomId);
            const owned = isRoomUnlocked(roomId, unlockedRooms);
            const canAfford =
              price.kind !== "coins" || wallet.coins >= price.amount;

            return (
              <RoomStoreCard
                key={roomId}
                roomId={roomId}
                isOwned={owned}
                isEquipped={equippedRoomId === roomId}
                canAfford={canAfford}
                onBuy={() => handleBuy(roomId)}
                onEquip={() => handleEquip(roomId)}
              />
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GameColors.background,
  },
  safe: {
    flex: 1,
    backgroundColor: GameColors.background,
  },
  screen: {
    flex: 1,
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(4),
    paddingBottom: moderateScale(8),
    gap: moderateScale(12),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    minHeight: moderateScale(48),
    justifyContent: "center",
    paddingRight: moderateScale(12),
  },
  backText: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: GameColors.text,
  },
  titleBlock: {
    gap: moderateScale(4),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "800",
    color: GameColors.text,
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    color: GameColors.textMuted,
  },
  feedbackBanner: {
    marginTop: moderateScale(6),
    backgroundColor: GameColors.card,
    borderWidth: 2,
    borderColor: GameColors.primary,
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(12),
  },
  feedbackText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: GameColors.text,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: moderateScale(12),
    paddingBottom: moderateScale(16),
  },
});
