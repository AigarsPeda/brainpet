import { PetSpeechBubble } from "@/components/pet/PetSpeechBubble";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { resolveSpriteDisplaySize } from "@/constants/cat-sprites";
import { GameColors } from "@/constants/game";
import { USE_CAT_SPRITE_PETS } from "@/constants/pet-display";
import { PetDisplay } from "@/pet-display/components/PetDisplay";
import type { PetPlaybackState } from "@/pet-display/types";
import type { PetStats, PetType } from "@/types/game";
import { clampStat } from "@/utils/pet-care";
import { moderateScale } from "@/utils/scale";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { type LayoutChangeEvent, StyleSheet, Text, View } from "react-native";

const COMPACT_PET_MIN = 200;
const COMPACT_PET_MAX = 300;
const COMPACT_SPRITE_PET_SIZE = 160;

function compactPetWidth(petType: PetType, compact: boolean) {
  const usesSprite = USE_CAT_SPRITE_PETS && petType === "cat";
  if (compact && usesSprite) {
    return moderateScale(COMPACT_SPRITE_PET_SIZE);
  }
  return moderateScale(compact ? 260 : 200);
}

function avatarDisplayWidth(
  petType: PetType,
  avatarWidth: number,
  displayWidth: number,
) {
  const usesSprite = USE_CAT_SPRITE_PETS && petType === "cat";
  return usesSprite ? displayWidth : avatarWidth;
}

type PetStageProps = {
  name: string;
  petType: PetType;
  stats: PetStats;
  wisdom: number;
  speechMessage?: string | null;
  playback: PetPlaybackState;
  compact?: boolean;
  onPetPress?: () => void;
  onAnimationComplete?: () => void;
  onStepComplete?: (stepIndex: number) => void;
};

function StatBar({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: number;
  color: string;
}) {
  const clamped = clampStat(value);

  return (
    <View style={styles.statRow}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <View style={styles.statContent}>
        <View style={styles.statHeader}>
          <Text style={styles.statLabel}>{label}</Text>
          <Text style={styles.statValue}>{clamped}%</Text>
        </View>
        <ProgressBar
          progress={clamped / 100}
          fillColor={color}
          trackColor={GameColors.background}
        />
      </View>
    </View>
  );
}

export function PetStage({
  name,
  petType,
  stats,
  wisdom,
  speechMessage,
  playback,
  compact = false,
  onPetPress,
  onAnimationComplete,
  onStepComplete,
}: PetStageProps) {
  const { t } = useTranslation();
  const usesSprite = USE_CAT_SPRITE_PETS && petType === "cat";
  const [avatarWidth, setAvatarWidth] = useState(
    compactPetWidth(petType, compact),
  );
  const displayWidth = usesSprite
    ? resolveSpriteDisplaySize(avatarWidth)
    : avatarWidth;
  const petDisplayWidth = avatarDisplayWidth(
    petType,
    avatarWidth,
    displayWidth,
  );

  const handleAvatarLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!compact || usesSprite) return;

      const { width } = event.nativeEvent.layout;
      const clamped = Math.max(
        moderateScale(COMPACT_PET_MIN),
        Math.min(moderateScale(COMPACT_PET_MAX), Math.round(width)),
      );

      setAvatarWidth(clamped);
    },
    [compact, usesSprite],
  );

  const petCluster = (
    <View
      style={[
        compact ? styles.petCenterSlot : styles.avatarCluster,
        !compact && { width: petDisplayWidth },
      ]}
    >
      {speechMessage ? (
        <View style={compact ? styles.speechAbovePet : styles.speechAnchor}>
          <PetSpeechBubble message={speechMessage} />
        </View>
      ) : null}
      <PetDisplay
        petType={petType}
        playback={playback}
        width={displayWidth}
        onPress={onPetPress}
        onAnimationComplete={onAnimationComplete}
        onStepComplete={onStepComplete}
      />
    </View>
  );

  return (
    <View style={[styles.stage, compact && styles.stageCompact]}>
      {!compact ? (
        <View style={styles.nameHeader}>
          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.levelText}>
            {t("pet.level", { level: stats.level })}
          </Text>
        </View>
      ) : null}

      <View style={styles.petColumnMeasure} onLayout={handleAvatarLayout}>
        <View style={[styles.petColumn, compact && styles.petColumnCompact]}>
          <View
            style={[styles.avatarWrap, compact && styles.avatarWrapCompact]}
          >
            {compact ? <View style={styles.petStack}>{petCluster}</View> : petCluster}
          </View>

          <View style={[styles.stats, compact && styles.statsCompact]}>
            <StatBar
              emoji="🍖"
              label={t("pet.fed")}
              value={clampStat(stats.hunger)}
              color={GameColors.hunger}
            />
            <StatBar
              emoji="✨"
              label={t("pet.cleanliness")}
              value={clampStat(stats.cleanliness)}
              color={GameColors.cleanliness}
            />
            <StatBar
              emoji="💛"
              label={t("pet.happiness")}
              value={stats.happiness}
              color={GameColors.happiness}
            />
            <StatBar
              emoji="🧠"
              label={t("pet.wisdom")}
              value={wisdom}
              color={GameColors.wisdom}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    backgroundColor: GameColors.card,
    borderRadius: moderateScale(20),
    paddingVertical: moderateScale(20),
    paddingHorizontal: moderateScale(20),
    alignItems: "center",
    gap: moderateScale(8),
    width: "100%",
  },
  stageCompact: {
    flex: 1,
    borderRadius: moderateScale(16),
    paddingTop: moderateScale(16),
    paddingBottom: moderateScale(16),
    paddingHorizontal: moderateScale(14),
  },
  nameHeader: {
    alignItems: "center",
    gap: moderateScale(2),
  },
  nameText: {
    fontSize: moderateScale(22),
    fontWeight: "700",
    color: GameColors.text,
  },
  levelText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: GameColors.textMuted,
    marginTop: 2,
  },
  petColumnMeasure: {
    width: "100%",
    flex: 1,
  },
  petColumn: {
    width: "100%",
    alignItems: "center",
    gap: moderateScale(8),
  },
  petColumnCompact: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: moderateScale(4),
  },
  avatarWrap: {
    minHeight: moderateScale(120),
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  avatarWrapCompact: {
    flex: 1,
    minHeight: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: moderateScale(12),
  },
  petStack: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  petCenterSlot: {
    alignItems: "center",
    justifyContent: "center",
  },
  speechAbovePet: {
    position: "absolute",
    bottom: "85%",
    left: moderateScale(30),
    alignItems: "flex-start",
    zIndex: 2,
  },
  avatarCluster: {
    position: "relative",
    alignItems: "center",
  },
  speechAnchor: {
    position: "absolute",
    bottom: "62%",
    left: moderateScale(20),
    alignItems: "flex-start",
    zIndex: 2,
  },
  stats: {
    width: "100%",
    gap: moderateScale(12),
  },
  statsCompact: {
    gap: moderateScale(6),
    paddingTop: moderateScale(8),
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
  },
  statEmoji: {
    fontSize: moderateScale(22),
    width: moderateScale(28),
    textAlign: "center",
  },
  statContent: {
    flex: 1,
    gap: moderateScale(4),
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: GameColors.text,
  },
  statValue: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: GameColors.textMuted,
  },
});
