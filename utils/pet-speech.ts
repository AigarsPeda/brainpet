import {
  PUZZLE_STREAK_NOTIFY_MIN,
} from "@/constants/game";
import { hasIncompletePuzzles } from "@/constants/puzzles";
import type { PetAnimationState, PetProfile, PuzzleProgress } from "@/types/game";
import type { AppLocale } from "@/types/locale";
import { isPetHungry } from "@/utils/pet-care";

const PET_TAP_KEYS = [
  "pet.speech.petTap1",
  "pet.speech.petTap2",
  "pet.speech.petTap3",
] as const;

export type PetTapSpeechKey = (typeof PET_TAP_KEYS)[number];

export type IdleSpeechContext = {
  pet: PetProfile;
  mood: PetAnimationState;
  locale: AppLocale;
  puzzlesSolved: PuzzleProgress;
  puzzleStreak: number;
};

export type IdleSpeech = {
  key: string;
  params?: Record<string, number>;
};

export function pickPetTapSpeechKey(): PetTapSpeechKey {
  const index = Math.floor(Math.random() * PET_TAP_KEYS.length);
  return PET_TAP_KEYS[index] ?? PET_TAP_KEYS[0];
}

/** Contextual line when the pet is not showing a short action message. */
export function getIdleSpeech({
  pet,
  mood,
  locale,
  puzzlesSolved,
  puzzleStreak,
}: IdleSpeechContext): IdleSpeech {
  if (pet.isAsleep || mood === "sleeping") {
    return { key: "pet.speech.sleeping" };
  }
  if (mood === "fallingAsleep") {
    return { key: "pet.speech.sleepy" };
  }
  if (pet.stats.happiness < 30) {
    return { key: "pet.speech.sad" };
  }
  if (isPetHungry(pet.stats)) {
    return { key: "pet.speech.hungry" };
  }
  if (puzzleStreak >= PUZZLE_STREAK_NOTIFY_MIN) {
    return { key: "pet.speech.streak", params: { count: puzzleStreak } };
  }
  if (hasIncompletePuzzles(locale, puzzlesSolved)) {
    return { key: "pet.speech.solvePuzzles" };
  }
  if (pet.stats.happiness >= 80) {
    return { key: "pet.speech.happy" };
  }
  return { key: "pet.speech.idle" };
}
