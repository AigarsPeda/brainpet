import { GameColors } from "@/constants/game";
import { moderateScale } from "@/utils/scale";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type StoreTab = "rooms" | "beds";

type StoreTabBarProps = {
  active: StoreTab;
  onChange: (tab: StoreTab) => void;
};

function StoreTabButton({
  tab,
  label,
  emoji,
  isActive,
  onPress,
}: {
  tab: StoreTab;
  label: string;
  emoji: string;
  isActive: boolean;
  onPress: (tab: StoreTab) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(tab)}
      style={[styles.tab, isActive && styles.tabActive]}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={label}
    >
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function StoreTabBar({ active, onChange }: StoreTabBarProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.row} accessibilityRole="tablist">
      <StoreTabButton
        tab="rooms"
        emoji="🏠"
        label={t("store.tabRooms")}
        isActive={active === "rooms"}
        onPress={onChange}
      />
      <StoreTabButton
        tab="beds"
        emoji="🛏️"
        label={t("store.tabBeds")}
        isActive={active === "beds"}
        onPress={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: moderateScale(8),
  },
  tab: {
    flex: 1,
    minHeight: moderateScale(48),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(6),
    borderRadius: moderateScale(14),
    borderWidth: 2,
    borderColor: GameColors.cardBorder,
    backgroundColor: GameColors.card,
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(8),
  },
  tabActive: {
    borderColor: GameColors.secondary,
    backgroundColor: "#E8FAF8",
  },
  tabEmoji: {
    fontSize: moderateScale(18),
  },
  tabText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: GameColors.textMuted,
  },
  tabTextActive: {
    color: GameColors.text,
  },
});
