import { resolveSpritePixelScale } from "@/constants/cat-sprites";
import { GameColors } from "@/constants/game";
import type { PetMediaSegment, SpriteSheetConfig } from "@/pet-display/types";
import { moderateScale } from "@/utils/scale";
import {
  Canvas,
  FilterMode,
  Group,
  Image as SkiaImage,
  MipmapMode,
  useImage,
} from "@shopify/react-native-skia";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const DEFAULT_SIZE = 200;
const VIEW_PADDING = 0.9;
const NEAREST_SAMPLING = {
  filter: FilterMode.Nearest,
  mipmap: MipmapMode.None,
};

type PetSpriteRendererProps = {
  segment?: PetMediaSegment;
  scenarioSteps?: PetMediaSegment[];
  size?: number;
  loop?: boolean;
  transparentBackground?: boolean;
  onAnimationComplete?: () => void;
  onStepComplete?: (stepIndex: number) => void;
  onPress?: () => void;
};

function segmentToken(steps: PetMediaSegment[]) {
  return steps
    .map(
      (step, index) =>
        `${step.assetKey}:${step.sprite?.source ?? 0}:${step.sprite?.fps ?? 0}:${step.loop ? "loop" : "once"}:${index}`,
    )
    .join("|");
}

function layoutFrame(
  sprite: SpriteSheetConfig,
  frameIndex: number,
  displaySize: number,
) {
  const coord = sprite.frames[frameIndex] ?? sprite.frames[0];
  const desiredFrameHeight = Math.floor(displaySize * VIEW_PADDING);
  const scale = resolveSpritePixelScale(sprite.frameHeight, desiredFrameHeight, {
    scaleReferenceHeight: sprite.scaleReferenceHeight,
    pixelScaleBoost: sprite.pixelScaleBoost,
    maxPixelScale: sprite.maxPixelScale,
  });
  const frameWidth = sprite.frameWidth * scale;
  const frameHeight = sprite.frameHeight * scale;
  const sheetWidth = sprite.sheetWidth * scale;
  const sheetHeight = sprite.sheetHeight * scale;

  return {
    coord,
    scale,
    frameWidth,
    frameHeight,
    sheetWidth,
    sheetHeight,
    imageX: -coord.col * sprite.frameWidth * scale,
    imageY: -coord.row * sprite.frameHeight * scale,
    anchor: sprite.anchor ?? "bottom-center",
    containerSize: Math.ceil(frameHeight / VIEW_PADDING),
  };
}

function SpriteFrame({
  sprite,
  frameIndex,
  displaySize,
}: {
  sprite: SpriteSheetConfig;
  frameIndex: number;
  displaySize: number;
}) {
  const image = useImage(sprite.source);
  const layout = useMemo(
    () => layoutFrame(sprite, frameIndex, displaySize),
    [displaySize, frameIndex, sprite],
  );

  return (
    <View
      style={[
        styles.frameWindow,
        {
          width: layout.containerSize,
          height: layout.containerSize,
          justifyContent: layout.anchor === "center" ? "center" : "flex-end",
        },
      ]}
    >
      <Canvas style={{ width: layout.frameWidth, height: layout.frameHeight }}>
        {image ? (
          <Group
            clip={{
              x: 0,
              y: 0,
              width: layout.frameWidth,
              height: layout.frameHeight,
            }}
          >
            <SkiaImage
              image={image}
              x={layout.imageX}
              y={layout.imageY}
              width={layout.sheetWidth}
              height={layout.sheetHeight}
              fit="fill"
              sampling={NEAREST_SAMPLING}
            />
          </Group>
        ) : null}
      </Canvas>
    </View>
  );
}

function useFrameAnimation(
  segment: PetMediaSegment | undefined,
  loopPlayback: boolean,
  onStepDone: () => void,
) {
  const [index, setIndex] = useState(0);
  const doneRef = useRef(false);
  const sprite = segment?.sprite;
  const frameCount = sprite?.frames.length ?? 0;
  const shouldLoop = loopPlayback || segment?.loop === true;

  useEffect(() => {
    setIndex(sprite?.reverse ? Math.max(frameCount - 1, 0) : 0);
    doneRef.current = false;
  }, [frameCount, segment?.assetKey, sprite?.reverse]);

  useEffect(() => {
    if (!sprite || frameCount === 0) return;

    const frameMs = 1000 / sprite.fps;
    const timer = setInterval(() => {
      setIndex((current) => {
        const delta = sprite.reverse ? -1 : 1;
        const next = current + delta;

        if (sprite.reverse) {
          if (next < 0) {
            if (shouldLoop) return frameCount - 1;
            if (!doneRef.current) {
              doneRef.current = true;
              queueMicrotask(onStepDone);
            }
            return 0;
          }
          return next;
        }

        if (next >= frameCount) {
          if (shouldLoop) return 0;
          if (!doneRef.current) {
            doneRef.current = true;
            queueMicrotask(onStepDone);
          }
          return frameCount - 1;
        }

        return next;
      });
    }, frameMs);

    return () => clearInterval(timer);
  }, [frameCount, onStepDone, shouldLoop, sprite]);

  return index;
}

export function PetSpriteRenderer({
  segment,
  scenarioSteps,
  size = moderateScale(DEFAULT_SIZE),
  loop = false,
  transparentBackground = false,
  onAnimationComplete,
  onStepComplete,
  onPress,
}: PetSpriteRendererProps) {
  const steps = scenarioSteps ?? (segment ? [segment] : []);
  const [stepIndex, setStepIndex] = useState(0);
  const tokenRef = useRef("");
  const onCompleteRef = useRef(onAnimationComplete);
  const onStepRef = useRef(onStepComplete);

  useEffect(() => {
    onCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  useEffect(() => {
    onStepRef.current = onStepComplete;
  }, [onStepComplete]);

  useEffect(() => {
    const token = segmentToken(steps);
    if (token === tokenRef.current) return;
    tokenRef.current = token;
    setStepIndex(0);
  }, [steps]);

  const active = steps[stepIndex];

  const finishStep = useCallback(() => {
    onStepRef.current?.(stepIndex);
    const next = stepIndex + 1;
    if (next < steps.length) {
      setStepIndex(next);
      return;
    }
    onCompleteRef.current?.();
  }, [stepIndex, steps.length]);

  const frameIndex = useFrameAnimation(active, loop, finishStep);

  const containerSize = useMemo(() => {
    if (!active?.sprite) return size;
    return layoutFrame(active.sprite, 0, size).containerSize;
  }, [active?.sprite, size]);

  const content = (
    <View
      style={[
        styles.container,
        transparentBackground && styles.containerTransparent,
        { width: containerSize, height: containerSize },
      ]}
    >
      {active?.sprite ? (
        <SpriteFrame
          sprite={active.sprite}
          frameIndex={frameIndex}
          displaySize={size}
        />
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      style={styles.pressable}
      accessibilityRole="button"
      accessibilityLabel="Pet your companion"
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: GameColors.petVideoBg,
    borderRadius: moderateScale(12),
  },
  containerTransparent: {
    backgroundColor: "transparent",
    borderRadius: 0,
  },
  frameWindow: {
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
  },
});
