import { PetVideoRenderer } from "@/pet-display/media/video/PetVideoRenderer";
import { getPetMediaRegistry } from "@/pet-display/registry/dog-video-registry";
import type {
  PetAnimationState,
  PetPlaybackState,
  PetType,
} from "@/pet-display/types";
import { moderateScale } from "@/utils/scale";
import { useMemo } from "react";

type PetDisplayProps = {
  width?: number;
  loop?: boolean;
  petType: PetType;
  /** Convenience — builds a single-segment playback from a mood. */
  mood?: PetAnimationState;
  playback?: PetPlaybackState;
  onPress?: () => void;
  onAnimationComplete?: () => void;
  onStepComplete?: (stepIndex: number) => void;
};

export function PetDisplay({
  mood,
  petType,
  playback,
  onPress,
  onStepComplete,
  onAnimationComplete,
  loop = false,
  width = moderateScale(200),
}: PetDisplayProps) {
  const registry = getPetMediaRegistry(petType);

  const resolvedPlayback = useMemo((): PetPlaybackState => {
    if (playback) return playback;

    const resolvedMood = mood ?? "idle";
    return {
      kind: "segment",
      segment: registry.getSegment(resolvedMood),
      mood: resolvedMood,
    };
  }, [mood, playback, registry]);

  if (registry.mediaKind === "video") {
    if (resolvedPlayback.kind === "scenario") {
      return (
        <PetVideoRenderer
          loop={loop}
          size={width}
          scenarioSteps={resolvedPlayback.steps}
          onAnimationComplete={onAnimationComplete}
          onStepComplete={onStepComplete}
          onPress={onPress}
        />
      );
    }

    return (
      <PetVideoRenderer
        loop={loop}
        size={width}
        segment={resolvedPlayback.segment}
        onAnimationComplete={onAnimationComplete}
        onStepComplete={onStepComplete}
        onPress={onPress}
      />
    );
  }

  return null;
}
