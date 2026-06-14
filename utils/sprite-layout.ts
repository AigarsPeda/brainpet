import type { FocusPoint, SpriteSheetLayout } from '@/types/sprite-sheet';

export type FrameRenderMetrics = {
  sheetWidth: number;
  sheetHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  imageWidth: number;
  imageHeight: number;
  offsetX: number;
  offsetY: number;
  shiftX: number;
  shiftY: number;
};

const DEFAULT_FOCUS = (layout: SpriteSheetLayout): FocusPoint => {
  if (layout.type === 'legacy-v1') {
    return {
      x: layout.frameWidth / 2,
      y: layout.cropTop + layout.cropHeight / 2,
    };
  }

  return {
    x: layout.frameWidth / 2,
    y: layout.frameHeight / 2,
  };
};

export function getSheetDimensions(layout: SpriteSheetLayout): {
  sheetWidth: number;
  sheetHeight: number;
} {
  if (layout.type === 'grid-v2') {
    const margin = layout.margin ?? layout.gutter;
    return {
      sheetWidth:
        margin * 2 +
        layout.sheetCols * layout.frameWidth +
        (layout.sheetCols - 1) * layout.gutter,
      sheetHeight:
        margin * 2 +
        layout.sheetRows * layout.frameHeight +
        (layout.sheetRows - 1) * layout.gutter,
    };
  }

  return {
    sheetWidth: layout.sheetWidth,
    sheetHeight: layout.sheetHeight,
  };
}

export function getFrameOrigin(
  layout: SpriteSheetLayout,
  frameIndex: number,
): { x: number; y: number } {
  const col = frameIndex % layout.sheetCols;
  const row = Math.floor(frameIndex / layout.sheetCols);

  if (layout.type === 'grid-v2') {
    const margin = layout.margin ?? layout.gutter;
    return {
      x: margin + col * (layout.frameWidth + layout.gutter),
      y: margin + row * (layout.frameHeight + layout.gutter),
    };
  }

  return {
    x: col * layout.frameWidth,
    y: row * layout.frameHeight,
  };
}

export function getFrameRenderMetrics(
  layout: SpriteSheetLayout,
  frameIndex: number,
  displayWidth: number,
  focusFrames?: FocusPoint[],
): FrameRenderMetrics {
  const { sheetWidth, sheetHeight } = getSheetDimensions(layout);
  const origin = getFrameOrigin(layout, frameIndex);
  const focus = focusFrames?.[frameIndex] ?? DEFAULT_FOCUS(layout);

  if (layout.type === 'grid-v2') {
    const scale = displayWidth / layout.frameWidth;
    const viewportHeight = Math.round(layout.frameHeight * scale);
    const imageWidth = Math.round(sheetWidth * scale);
    const imageHeight = Math.round(sheetHeight * scale);

    return {
      sheetWidth,
      sheetHeight,
      viewportWidth: displayWidth,
      viewportHeight,
      imageWidth,
      imageHeight,
      offsetX: -Math.round(origin.x * scale),
      offsetY: -Math.round(origin.y * scale),
      shiftX: 0,
      shiftY: 0,
    };
  }

  const scale = displayWidth / layout.frameWidth;
  const cropTop = Math.round(layout.cropTop * scale);
  const cropH = Math.round(layout.cropHeight * scale);
  const imageWidth = Math.round(sheetWidth * scale);
  const imageHeight = Math.round(sheetHeight * scale);
  const focusYInCrop = (focus.y - layout.cropTop) * scale;

  return {
    sheetWidth,
    sheetHeight,
    viewportWidth: displayWidth,
    viewportHeight: cropH,
    imageWidth,
    imageHeight,
    offsetX: -Math.round(origin.x * scale),
    offsetY: -Math.round(origin.y * scale) - cropTop,
    shiftX: Math.round((layout.frameWidth / 2 - focus.x) * scale),
    shiftY: Math.round(cropH / 2 - focusYInCrop),
  };
}

export function getFrameCount(layout: SpriteSheetLayout): number {
  return layout.sheetCols * layout.sheetRows;
}
