import { GameColors } from "@/constants/game";
import { moderateScale } from "@/utils/scale";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

type PuzzleStreakBannerProps = {
  count: number;
};

export function PuzzleStreakBanner({ count }: PuzzleStreakBannerProps) {
  const { t } = useTranslation();

  return (
    <View
      style={styles.banner}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.emoji}>🔥</Text>
      <Text style={styles.text}>
        {t("home.puzzleStreak", { count })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(8),
    backgroundColor: GameColors.card,
    borderRadius: moderateScale(14),
    borderWidth: 2,
    borderColor: GameColors.primary,
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(14),
  },
  emoji: {
    fontSize: moderateScale(18),
  },
  text: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: GameColors.text,
  },
});
