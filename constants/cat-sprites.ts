/** Classical Individual strips — each row is 32px tall. */
export const CAT_SPRITE_FRAME_HEIGHT = 32;

/** Keep pixel art crisp with Skia nearest-neighbor sampling. */
export const CAT_SPRITE_MAX_SCALE = 4;

export type SpriteScaleOptions = {
  scaleReferenceHeight?: number;
  pixelScaleBoost?: number;
  maxPixelScale?: number;
};

export function resolveSpritePixelScale(
  frameHeight: number,
  desiredFrameHeight: number,
  options: SpriteScaleOptions = {},
): number {
  const scaleReferenceHeight = options.scaleReferenceHeight ?? frameHeight;
  const pixelScaleBoost = options.pixelScaleBoost ?? 0;
  const maxPixelScale = options.maxPixelScale ?? CAT_SPRITE_MAX_SCALE;

  const logicalScale = Math.min(
    CAT_SPRITE_MAX_SCALE,
    Math.max(1, Math.floor(desiredFrameHeight / scaleReferenceHeight)),
  );

  const baseScale = Math.round(
    (logicalScale * scaleReferenceHeight) / frameHeight,
  );

  return Math.max(1, Math.min(maxPixelScale, baseScale + pixelScaleBoost));
}

export function resolveSpriteDisplaySize(
  requestedSize: number,
  frameHeight = CAT_SPRITE_FRAME_HEIGHT,
  viewPadding = 0.9,
  scaleOptions: SpriteScaleOptions = {},
): number {
  const desiredFrameHeight = Math.floor(requestedSize * viewPadding);
  const scale = resolveSpritePixelScale(frameHeight, desiredFrameHeight, {
    scaleReferenceHeight: frameHeight,
    ...scaleOptions,
  });
  const frameDisplayHeight = scale * frameHeight;
  return Math.ceil(frameDisplayHeight / viewPadding);
}
