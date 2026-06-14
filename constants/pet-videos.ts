import type { PetMood } from "@/types/game";
import type { AVPlaybackSource } from "expo-av";

export type PetVideoConfig = {
  source: AVPlaybackSource;
  loop: boolean;
  /** Skip intro — start playback at this time (milliseconds). */
  startMs?: number;
};

/** Dog mood → video in assets/video/ */
export const PET_VIDEOS: Record<PetMood, PetVideoConfig> = {
  idle: {
    source: require("@/assets/video/idle.mp4"),
    loop: true,
  },
  excited: {
    source: require("@/assets/video/love.mp4"),
    loop: false,
    startMs: 8000,
  },
  dancing: {
    source: require("@/assets/video/idle.mp4"),
    loop: false,
    startMs: 5000,
  },
  eating: {
    source: require("@/assets/video/eating.mp4"),
    loop: false,
    startMs: 5000,
  },
  angry: {
    source: require("@/assets/video/sad2.mp4"),
    loop: true,
    startMs: 5000,
  },
  sad: {
    source: require("@/assets/video/sad.mp4"),
    loop: true,
    startMs: 5000,
  },
  sleeping: {
    source: require("@/assets/video/sleeping.mp4"),
    loop: true,
    startMs: 5000,
  },
};

export function getPetVideo(mood: PetMood): PetVideoConfig {
  return PET_VIDEOS[mood];
}
