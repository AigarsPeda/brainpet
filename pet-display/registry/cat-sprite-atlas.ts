import { CAT_SPRITE_FRAME_HEIGHT } from "@/constants/cat-sprites";
import type { SpriteSheetConfig } from "@/pet-display/types";

const SOURCES = {
  idle: require("@/assets/pets/Cat/Sprites/Classical/Individual/Idle.png"),
  idle2: require("@/assets/pets/Cat/Sprites/Classical/Individual/Idle2.png"),
  excited: require("@/assets/pets/Cat/Sprites/Classical/Individual/Excited.png"),
  dance: require("@/assets/pets/Cat/Sprites/Classical/Individual/Dance.png"),
  eating: require("@/assets/pets/Cat/Sprites/Classical/Individual/Eating.png"),
  sad: require("@/assets/pets/Cat/Sprites/Classical/Individual/Sad.png"),
  cry: require("@/assets/pets/Cat/Sprites/Classical/Individual/Cry.png"),
  surprised: require("@/assets/pets/Cat/Sprites/Classical/Individual/Surprised.png"),
  sleepy: require("@/assets/pets/Cat/Sprites/Classical/Individual/Sleepy.png"),
  sleep: require("@/assets/pets/Cat/Sprites/Classical/Individual/Sleep.png"),
  waiting: require("@/assets/pets/Cat/Sprites/Classical/Individual/Waiting.png"),
  layDown: require("@/assets/pets/Cat/Sprites/Classical/Individual/LayDown.png"),
  box1: require("@/assets/pets/Cat/Sprites/Classical/Individual/Box1.png"),
  box2: require("@/assets/pets/Cat/Sprites/Classical/Individual/Box2.png"),
  box3: require("@/assets/pets/Cat/Sprites/Classical/Individual/Box3.png"),
  catsick1: require("@/assets/pets/Cat/Sprites/Classical/Individual/catsick1.png"),
  catsick2: require("@/assets/pets/Cat/Sprites/Classical/Individual/catsick2.png"),
  dead: require("@/assets/pets/Cat/Sprites/Classical/Individual/DeadCat.png"),
  bathtub: require("@/assets/pets/Cat/Sprites/13Jul2025UpdateBathtab.png"),
} as const;

/** White bathtub row on the bath sheet — 448×512, 7×8 grid of 64×64 cells. */
const BATH_SHEET = {
  width: 448,
  height: 512,
  frameWidth: 64,
  frameHeight: 64,
  whiteBathRow: 0,
  frameCount: 7,
} as const;

function strip(
  source: number,
  sheetWidth: number,
  frameCount: number,
  fps: number,
  options: { reverse?: boolean } = {},
): SpriteSheetConfig {
  return {
    source,
    frameWidth: CAT_SPRITE_FRAME_HEIGHT,
    frameHeight: CAT_SPRITE_FRAME_HEIGHT,
    sheetWidth,
    sheetHeight: CAT_SPRITE_FRAME_HEIGHT,
    frames: Array.from({ length: frameCount }, (_, col) => ({ col, row: 0 })),
    fps,
    anchor: "bottom-center",
    reverse: options.reverse,
  };
}

function gridRow(
  source: number,
  sheetWidth: number,
  sheetHeight: number,
  frameWidth: number,
  frameHeight: number,
  row: number,
  startCol: number,
  frameCount: number,
  fps: number,
  options: {
    reverse?: boolean;
    scaleReferenceHeight?: number;
    pixelScaleBoost?: number;
    maxPixelScale?: number;
  } = {},
): SpriteSheetConfig {
  return {
    source,
    frameWidth,
    frameHeight,
    sheetWidth,
    sheetHeight,
    frames: Array.from({ length: frameCount }, (_, index) => ({
      col: startCol + index,
      row,
    })),
    fps,
    anchor: "bottom-center",
    reverse: options.reverse,
    scaleReferenceHeight: options.scaleReferenceHeight,
    pixelScaleBoost: options.pixelScaleBoost,
    maxPixelScale: options.maxPixelScale,
  };
}

/** Measured from `Sprites/Classical/Individual/*.png` — 32px-tall horizontal strips. */
export const CAT_SPRITE_ANIMATIONS = {
  idle: strip(SOURCES.idle, 320, 10, 6),
  idle2: strip(SOURCES.idle2, 320, 10, 6),
  excited: strip(SOURCES.excited, 384, 12, 10),
  dance: strip(SOURCES.dance, 128, 4, 10),
  eating: strip(SOURCES.eating, 480, 15, 8),
  sad: strip(SOURCES.sad, 288, 9, 5),
  cry: strip(SOURCES.cry, 128, 4, 5),
  surprised: strip(SOURCES.surprised, 384, 12, 8),
  sleepy: strip(SOURCES.sleepy, 256, 8, 5),
  sleep: strip(SOURCES.sleep, 128, 4, 4),
  waiting: strip(SOURCES.waiting, 192, 6, 6),
  layDown: strip(SOURCES.layDown, 384, 12, 5),
  box1: strip(SOURCES.box1, 128, 4, 8),
  box2: strip(SOURCES.box2, 384, 12, 8),
  box3: strip(SOURCES.box3, 128, 4, 8),
  catsick1: strip(SOURCES.catsick1, 160, 5, 5),
  catsick2: strip(SOURCES.catsick2, 128, 4, 5),
  dead: strip(SOURCES.dead, 32, 1, 4),
  bath: gridRow(
    SOURCES.bathtub,
    BATH_SHEET.width,
    BATH_SHEET.height,
    BATH_SHEET.frameWidth,
    BATH_SHEET.frameHeight,
    BATH_SHEET.whiteBathRow,
    0,
    BATH_SHEET.frameCount,
    6,
    {
      scaleReferenceHeight: CAT_SPRITE_FRAME_HEIGHT,
      pixelScaleBoost: 2,
      maxPixelScale: 5,
    },
  ),
} as const;

export type CatSpriteAnimationId = keyof typeof CAT_SPRITE_ANIMATIONS;
