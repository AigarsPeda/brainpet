import type { ImageSourcePropType } from 'react-native';

import type { PetMood } from '@/types/game';

export type FocusPoint = {
  x: number;
  y: number;
};

/** Original dog sheets — tight 2×2 grid with manual crop + focus alignment. */
export type LegacyV1Layout = {
  type: 'legacy-v1';
  sheetCols: number;
  sheetRows: number;
  sheetWidth: number;
  sheetHeight: number;
  frameWidth: number;
  frameHeight: number;
  cropTop: number;
  cropHeight: number;
};

/**
 * Standard layout for new pets — fixed frame size with generous gutters
 * so frames never overlap and are easy to slice in Figma/Aseprite.
 */
export type GridV2Layout = {
  type: 'grid-v2';
  sheetCols: number;
  sheetRows: number;
  frameWidth: number;
  frameHeight: number;
  /** Transparent gap between adjacent frames (minimum 32 px). */
  gutter: number;
  /** Transparent border around the entire sheet (defaults to gutter). */
  margin?: number;
};

export type SpriteSheetLayout = LegacyV1Layout | GridV2Layout;

export type AnimationSheetConfig = {
  source: ImageSourcePropType;
  frames: number;
  focusFrames?: FocusPoint[];
};

export type PetSpriteManifest = {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  layout: SpriteSheetLayout;
  /** AI / art prompt used to generate this pet (see assets/pets/<id>/prompt.md). */
  promptVersion: string;
  animations: Record<PetMood, AnimationSheetConfig>;
};
