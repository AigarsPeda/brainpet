import { ONE_SHOT_ANIMATIONS } from "@/constants/game";
import {
  CAT_SPRITE_ANIMATIONS,
  type CatSpriteAnimationId,
} from "@/pet-display/registry/cat-sprite-atlas";
import type { PetAnimationState } from "@/types/game";
import type {
  PetMediaRegistry,
  PetMediaScenario,
  PetMediaSegment,
  PetScenarioId,
  SpriteSheetConfig,
} from "@/pet-display/types";

function spriteSegment(
  animationId: CatSpriteAnimationId,
  options: { loop?: boolean; fps?: number; reverse?: boolean } = {},
): PetMediaSegment {
  const base = CAT_SPRITE_ANIMATIONS[animationId];
  const sprite: SpriteSheetConfig = {
    ...base,
    fps: options.fps ?? base.fps,
    reverse: options.reverse ?? base.reverse,
  };

  return {
    assetKey: animationId,
    loop: options.loop ?? true,
    sprite,
  };
}

const MOOD_ANIMATIONS: Record<PetAnimationState, CatSpriteAnimationId> = {
  idle: "idle",
  excited: "excited",
  dancing: "dance",
  eating: "eating",
  angry: "surprised",
  sad: "sad",
  fallingAsleep: "sleepy",
  sleeping: "sleep",
  correct: "excited",
  coinCatch: "waiting",
  bathing: "bath",
};

const MOOD_OPTIONS: Partial<
  Record<
    PetAnimationState,
    { loop?: boolean; fps?: number; reverse?: boolean }
  >
> = {
  idle: { loop: true, fps: 6 },
  excited: { loop: false, fps: 10 },
  dancing: { loop: false, fps: 10 },
  eating: { loop: false, fps: 8 },
  sad: { loop: true, fps: 5 },
  angry: { loop: true, fps: 8 },
  fallingAsleep: { loop: false, fps: 5 },
  sleeping: { loop: true, fps: 4 },
  correct: { loop: false, fps: 10 },
  coinCatch: { loop: false, fps: 6 },
  bathing: { loop: false, fps: 6 },
};

function segmentFromMood(mood: PetAnimationState): PetMediaSegment {
  return spriteSegment(MOOD_ANIMATIONS[mood], MOOD_OPTIONS[mood]);
}

const CAT_SPRITE_SCENARIOS: Record<PetScenarioId, PetMediaScenario> = {
  fallAsleep: {
    id: "fallAsleep",
    label: "Getting sleepy…",
    steps: [
      spriteSegment("sleepy", { loop: false, fps: 5 }),
      spriteSegment("sleep", { loop: true, fps: 4 }),
    ],
  },
  wakeUp: {
    id: "wakeUp",
    label: "Waking up…",
    steps: [spriteSegment("sleepy", { loop: false, fps: 5, reverse: true })],
  },
};

export const catSpriteRegistry: PetMediaRegistry = {
  petType: "cat",
  mediaKind: "sprite",
  oneShotStates: ONE_SHOT_ANIMATIONS,
  pickExcitedMood: () => "excited",
  getSegment: segmentFromMood,
  getScenario: (id) => CAT_SPRITE_SCENARIOS[id],
};
