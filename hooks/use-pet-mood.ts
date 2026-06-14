import type { PetMood, PetStats } from "@/types/game";
import { useMemo } from "react";

const LOW_STAT_THRESHOLD = 30;

export function usePetMood(stats: PetStats): PetMood {
  return useMemo(() => {
    if (stats.hunger < LOW_STAT_THRESHOLD) {
      return "sad";
    }
    if (stats.happiness < LOW_STAT_THRESHOLD) {
      return "sad";
    }
    return "idle";
  }, [stats.happiness, stats.hunger]);
}
