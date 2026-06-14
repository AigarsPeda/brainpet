import { Image, type ImageSourcePropType, StyleSheet, View } from 'react-native';

import type { FocusPoint } from '@/components/pet/sprites';
import type { SpriteSheetLayout } from '@/types/sprite-sheet';
import { getFrameRenderMetrics } from '@/utils/sprite-layout';

type SpriteFrameProps = {
  src: ImageSourcePropType;
  frame: number;
  layout: SpriteSheetLayout;
  width?: number;
  focusFrames?: FocusPoint[];
};

export function SpriteFrame({
  src,
  frame,
  layout,
  width = 150,
  focusFrames,
}: SpriteFrameProps) {
  const metrics = getFrameRenderMetrics(layout, frame, width, focusFrames);

  return (
    <View
      style={[
        styles.viewport,
        { width: metrics.viewportWidth, height: metrics.viewportHeight },
      ]}
    >
      <View
        style={[
          styles.clip,
          {
            width: metrics.viewportWidth,
            height: metrics.viewportHeight,
            left: metrics.shiftX,
            top: metrics.shiftY,
          },
        ]}
      >
        <Image
          source={src}
          style={{
            position: 'absolute',
            width: metrics.imageWidth,
            height: metrics.imageHeight,
            left: metrics.offsetX,
            top: metrics.offsetY,
          }}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    overflow: 'hidden',
  },
  clip: {
    position: 'absolute',
    overflow: 'hidden',
  },
});
