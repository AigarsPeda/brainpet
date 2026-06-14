import type { GridV2Layout } from '@/types/sprite-sheet';

/**
 * BrainPet standard sprite sheet spec (v2).
 * Use these numbers in AI prompts and when validating new assets.
 */
export const SPRITE_SPEC = {
  /** Logical pixel size — Game Boy / Tamagotchi scale reference. */
  logicalFrameSize: 32,
  /** Export multiplier for crisp mobile display (32 × 4 = 128 px frames). */
  exportScale: 4,
  frameWidth: 128,
  frameHeight: 128,
  /** Minimum transparent gap between frames — prevents overlap when slicing. */
  gutterMin: 32,
  /** Recommended gutter for AI-generated sheets. */
  gutter: 32,
  /** Outer transparent border around the full sheet. */
  margin: 32,
  sheetCols: 2,
  sheetRows: 2,
  framesPerAnimation: 4,
} as const;

export function buildGridV2Layout(
  overrides?: Partial<GridV2Layout>,
): GridV2Layout {
  return {
    type: 'grid-v2',
    sheetCols: SPRITE_SPEC.sheetCols,
    sheetRows: SPRITE_SPEC.sheetRows,
    frameWidth: SPRITE_SPEC.frameWidth,
    frameHeight: SPRITE_SPEC.frameHeight,
    gutter: SPRITE_SPEC.gutter,
    margin: SPRITE_SPEC.margin,
    ...overrides,
  };
}

/** Total PNG dimensions for a standard 2×2 v2 sheet. */
export function getStandardSheetPixelSize(layout: GridV2Layout): {
  width: number;
  height: number;
} {
  const margin = layout.margin ?? layout.gutter;
  const width =
    margin * 2 +
    layout.sheetCols * layout.frameWidth +
    (layout.sheetCols - 1) * layout.gutter;
  const height =
    margin * 2 +
    layout.sheetRows * layout.frameHeight +
    (layout.sheetRows - 1) * layout.gutter;

  return { width, height };
}

/** Standard v2 sheet is 352×352 px (128 frames + 32 gutters + 32 margins). */
export const STANDARD_SHEET_SIZE = getStandardSheetPixelSize(
  buildGridV2Layout(),
);
