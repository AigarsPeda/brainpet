import type { ImageSourcePropType } from 'react-native';

import { DEFAULT_PET_ID, getPetManifest } from '@/assets/pets/registry';
import type { PetMood } from '@/types/game';
import type { FocusPoint, SpriteSheetLayout } from '@/types/sprite-sheet';
import { getFrameCount } from '@/utils/sprite-layout';

export type SpriteConfig = {
  mood: PetMood;
  src: ImageSourcePropType;
  layout: SpriteSheetLayout;
  frameCount: number;
  focusFrames?: FocusPoint[];
};

const activeManifest = getPetManifest(DEFAULT_PET_ID);

export const PET_LAYOUT = activeManifest.layout;

export const SHEET_COLS = activeManifest.layout.sheetCols;
export const SHEET_ROWS = activeManifest.layout.sheetRows;
export const FRAME_COUNT = getFrameCount(activeManifest.layout);

/** @deprecated Use PET_LAYOUT — kept for imports that reference legacy names */
export const SHEET_W =
  activeManifest.layout.type === 'legacy-v1'
    ? activeManifest.layout.sheetWidth
    : 0;
export const SHEET_H =
  activeManifest.layout.type === 'legacy-v1'
    ? activeManifest.layout.sheetHeight
    : 0;
export const FRAME_W = activeManifest.layout.frameWidth;
export const FRAME_H =
  activeManifest.layout.type === 'legacy-v1'
    ? activeManifest.layout.frameHeight
    : activeManifest.layout.frameHeight;
export const CROP_TOP_ORIG =
  activeManifest.layout.type === 'legacy-v1'
    ? activeManifest.layout.cropTop
    : 0;
export const CROP_H_ORIG =
  activeManifest.layout.type === 'legacy-v1'
    ? activeManifest.layout.cropHeight
    : activeManifest.layout.frameHeight;

export const DEFAULT_PET_WIDTH = 180;

export const SPRITES: SpriteConfig[] = (
  Object.entries(activeManifest.animations) as [
    PetMood,
    (typeof activeManifest.animations)[PetMood],
  ][]
).map(([mood, animation]) => ({
  mood,
  src: animation.source,
  layout: activeManifest.layout,
  frameCount: animation.frames,
  focusFrames: animation.focusFrames,
}));

export const SPRITE_BY_MOOD = Object.fromEntries(
  SPRITES.map((sprite) => [sprite.mood, sprite]),
) as Record<PetMood, SpriteConfig>;

export type { FocusPoint };
