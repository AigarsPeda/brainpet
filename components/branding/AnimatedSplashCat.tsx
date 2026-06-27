import { CAT_SPRITE_FRAME_HEIGHT } from "@/constants/cat-sprites";
import { GameColors } from "@/constants/game";
import { moderateScale } from "@/utils/scale";
import {
  Canvas,
  FilterMode,
  Group,
  MipmapMode,
  Image as SkiaImage,
  useImage,
} from "@shopify/react-native-skia";
import { useEffect, useState, type ReactNode } from "react";
import { Image, StyleSheet, View } from "react-native";

const IDLE_SPRITE = require("@/assets/pets/Cat/Sprites/Classical/Individual/Idle.png");

const FRAME_SIZE = CAT_SPRITE_FRAME_HEIGHT;
const FRAME_COUNT = 10;
const SHEET_WIDTH = 320;
const FPS = 6;

const NEAREST_SAMPLING = {
  filter: FilterMode.Nearest,
  mipmap: MipmapMode.None,
};

type AnimatedSplashCatProps = {
  size?: number;
};

function useSplashLayout(size: number) {
  const pixelScale = Math.max(4, Math.floor(size / FRAME_SIZE));
  const displaySize = FRAME_SIZE * pixelScale;
  const scaledSheetWidth = SHEET_WIDTH * pixelScale;
  const scaledSheetHeight = FRAME_SIZE * pixelScale;

  return { pixelScale, displaySize, scaledSheetWidth, scaledSheetHeight };
}

/** Crisp pixel-art idle loop — Skia nearest-neighbor, same as in-game cat. */
export function AnimatedSplashCat({
  size = moderateScale(192),
}: AnimatedSplashCatProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const skiaImage = useImage(IDLE_SPRITE);
  const { pixelScale, displaySize, scaledSheetWidth, scaledSheetHeight } =
    useSplashLayout(size);
  const imageX = -frameIndex * FRAME_SIZE * pixelScale;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((current) => (current + 1) % FRAME_COUNT);
    }, 1000 / FPS);

    return () => clearInterval(interval);
  }, []);

  const windowStyle = {
    width: displaySize,
    height: displaySize,
    overflow: "hidden" as const,
  };

  const stripStyle = {
    width: scaledSheetWidth,
    height: scaledSheetHeight,
    transform: [{ translateX: imageX }],
  };

  if (!skiaImage) {
    return (
      <View style={[styles.wrap, windowStyle]}>
        <Image
          source={IDLE_SPRITE}
          style={stripStyle}
          resizeMode="stretch"
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, windowStyle]}>
      <Canvas style={{ width: displaySize, height: displaySize }}>
        <Group clip={{ x: 0, y: 0, width: displaySize, height: displaySize }}>
          <SkiaImage
            image={skiaImage}
            x={imageX}
            y={0}
            width={scaledSheetWidth}
            height={scaledSheetHeight}
            fit="fill"
            sampling={NEAREST_SAMPLING}
          />
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GameColors.background,
    zIndex: 100,
  },
});

export function SplashBackdrop({ children }: { children: ReactNode }) {
  return <View style={styles.backdrop}>{children}</View>;
}
