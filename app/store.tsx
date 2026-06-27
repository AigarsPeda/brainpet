import { GameHeaderStats } from "@/components/economy/GameHeaderStats";
import { BedStoreCard } from "@/components/store/BedStoreCard";
import { RoomStoreCard } from "@/components/store/RoomStoreCard";
import { StoreTabBar, type StoreTab } from "@/components/store/StoreTabBar";
import { NotificationBanner } from "@/components/ui/NotificationBanner";
import { SlideInNotificationSlot } from "@/components/ui/SlideInNotificationSlot";
import { CAT_BED_IDS, type CatBedId } from "@/constants/cat-beds";
import { CAT_ROOM_IDS, type CatRoomId } from "@/constants/cat-rooms";
import { GameColors } from "@/constants/game";
import { useGame } from "@/contexts/GameProvider";
import type { BedPurchaseResult, RoomPurchaseResult } from "@/types/store";
import {
  getBedStorePrice,
  isBedUnlocked,
} from "@/utils/bed-store";
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

const FEEDBACK_VISIBLE_MS = 2800;

type StoreFeedback = {
  emoji: string;
  message: string;
};

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
    purchaseBed,
    equipBed,
    recordInteraction,
  } = useGame();

  const unlockedRooms = progress.roomsUnlocked as CatRoomId[];
  const unlockedBeds = progress.bedsUnlocked as CatBedId[];
  const equippedRoomId = pet.roomId as CatRoomId | undefined;
  const equippedBedId = pet.bedId as CatBedId | undefined;
  const [activeTab, setActiveTab] = useState<StoreTab>("rooms");
  const [feedback, setFeedback] = useState<StoreFeedback | null>(null);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const handleFeedbackDismissed = useCallback(() => {
    setFeedback(null);
  }, []);

  const showFeedback = useCallback(
    (emoji: string, message: string) => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
      setFeedback({ emoji, message });
      setFeedbackVisible(true);
      feedbackTimerRef.current = setTimeout(() => {
        setFeedbackVisible(false);
        feedbackTimerRef.current = null;
      }, FEEDBACK_VISIBLE_MS);
    },
    [],
  );

  const handleTabChange = useCallback(
    (tab: StoreTab) => {
      recordInteraction();
      triggerHaptic();
      setActiveTab(tab);
    },
    [recordInteraction],
  );

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
          return {
            emoji: "🏠",
            message: t("store.purchased", { number: roomNumber }),
          };
        case "already_owned":
          return {
            emoji: "✓",
            message: t("store.alreadyOwned"),
          };
        case "insufficient_funds": {
          const price = getRoomStorePrice(roomId);
          const cost = price.kind === "coins" ? price.amount : 0;
          return {
            emoji: "🪙",
            message: t("store.needCoins", { cost }),
          };
        }
        default:
          return {
            emoji: "⚠️",
            message: t("store.unavailable"),
          };
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
        const { emoji, message } = showPurchaseMessage(result, roomId);
        showFeedback(emoji, message);
      }
    },
    [purchaseRoom, recordInteraction, showFeedback, showPurchaseMessage],
  );

  const handleEquip = useCallback(
    (roomId: CatRoomId) => {
      recordInteraction();
      triggerHaptic();
      const equipped = equipRoom(roomId);
      if (equipped) {
        const roomNumber = Number.parseInt(roomId.replace("room", ""), 10);
        showFeedback("✨", t("store.equippedRoom", { number: roomNumber }));
      }
    },
    [equipRoom, recordInteraction, showFeedback, t],
  );

  const showBedPurchaseMessage = useCallback(
    (result: BedPurchaseResult, bedId: CatBedId) => {
      const bedName = t(`store.bedName.${bedId}`);
      switch (result) {
        case "purchased":
          return {
            emoji: "🛏️",
            message: t("store.purchasedBed", { name: bedName }),
          };
        case "already_owned":
          return {
            emoji: "✓",
            message: t("store.alreadyOwnedBed"),
          };
        case "insufficient_funds": {
          const price = getBedStorePrice(bedId);
          const cost = price.kind === "coins" ? price.amount : 0;
          return {
            emoji: "🪙",
            message: t("store.needCoinsBed", { cost }),
          };
        }
        default:
          return {
            emoji: "⚠️",
            message: t("store.unavailableBed"),
          };
      }
    },
    [t],
  );

  const handleBuyBed = useCallback(
    (bedId: CatBedId) => {
      recordInteraction();
      triggerHaptic();
      const result = purchaseBed(bedId);
      if (result === "purchased") {
        triggerHaptic();
      }
      if (result !== "already_owned") {
        const { emoji, message } = showBedPurchaseMessage(result, bedId);
        showFeedback(emoji, message);
      }
    },
    [purchaseBed, recordInteraction, showBedPurchaseMessage, showFeedback],
  );

  const handleEquipBed = useCallback(
    (bedId: CatBedId) => {
      recordInteraction();
      triggerHaptic();
      const equipped = equipBed(bedId);
      if (equipped) {
        showFeedback(
          "✨",
          t("store.equippedBed", { name: t(`store.bedName.${bedId}`) }),
        );
      }
    },
    [equipBed, recordInteraction, showFeedback, t],
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
          <Text style={styles.subtitle}>
            {activeTab === "rooms"
              ? t("store.subtitleRooms")
              : t("store.subtitleBeds")}
          </Text>
        </View>

        <StoreTabBar active={activeTab} onChange={handleTabChange} />

        <View style={styles.content}>
          <SlideInNotificationSlot
            visible={feedbackVisible}
            onDismissComplete={handleFeedbackDismissed}
          >
            {feedback ? (
              <NotificationBanner
                emoji={feedback.emoji}
                message={feedback.message}
              />
            ) : null}
          </SlideInNotificationSlot>

          <ScrollView
            key={activeTab}
            style={styles.scroll}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "rooms"
              ? CAT_ROOM_IDS.map((roomId) => {
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
                })
              : CAT_BED_IDS.map((bedId) => {
                  const price = getBedStorePrice(bedId);
                  const owned = isBedUnlocked(bedId, unlockedBeds);
                  const canAfford =
                    price.kind !== "coins" || wallet.coins >= price.amount;

                  return (
                    <BedStoreCard
                      key={bedId}
                      bedId={bedId}
                      isOwned={owned}
                      isEquipped={equippedBedId === bedId}
                      canAfford={canAfford}
                      onBuy={() => handleBuyBed(bedId)}
                      onEquip={() => handleEquipBed(bedId)}
                    />
                  );
                })}
          </ScrollView>
        </View>
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
  content: {
    flex: 1,
    minHeight: 0,
    gap: moderateScale(10),
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
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: moderateScale(12),
    paddingBottom: moderateScale(16),
  },
});
