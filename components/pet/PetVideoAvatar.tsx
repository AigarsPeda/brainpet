import { GameColors } from '@/constants/game';
import type { PetVideoKey } from '@/constants/pet-videos';
import {
  PET_VIDEO_KEYS,
  usePetVideoPlayers,
} from '@/hooks/use-pet-video-players';
import type { PetVideoSegment } from '@/types/pet-animation';
import { moderateScale } from '@/utils/scale';
import { VideoView } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

const DEFAULT_SIZE = 200;
const SEGMENT_POLL_MS = 80;
const REVERSE_POLL_MS = 33;
const REVERSE_STEP_SEC = REVERSE_POLL_MS / 1000;

type PetVideoAvatarProps = {
  segment?: PetVideoSegment;
  scenarioSteps?: PetVideoSegment[];
  size?: number;
  loop?: boolean;
  onAnimationComplete?: () => void;
  onStepComplete?: (stepIndex: number) => void;
  onPress?: () => void;
};

function segmentKey(segment: PetVideoSegment, index: number) {
  return `${segment.videoKey}:${segment.startMs ?? 0}:${segment.endMs ?? 'end'}:${segment.reverse ? 'rev' : 'fwd'}:${index}`;
}

export function PetVideoAvatar({
  segment,
  scenarioSteps,
  size = moderateScale(DEFAULT_SIZE),
  loop = false,
  onAnimationComplete,
  onStepComplete,
  onPress,
}: PetVideoAvatarProps) {
  const players = usePetVideoPlayers();
  const onCompleteRef = useRef(onAnimationComplete);
  const onStepCompleteRef = useRef(onStepComplete);
  const loopRef = useRef(loop);
  const applySegmentRef = useRef<
    (config: PetVideoSegment, stepIndex: number) => void
  >(() => {});
  const activeKeyRef = useRef<PetVideoKey>(
    scenarioSteps?.[0]?.videoKey ?? segment?.videoKey ?? 'idle',
  );
  const [activeKey, setActiveKey] = useState<PetVideoKey>(activeKeyRef.current);
  const readyRef = useRef(false);
  const segmentTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepIndexRef = useRef(0);
  const stepsRef = useRef<PetVideoSegment[]>([]);

  useEffect(() => {
    onCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  useEffect(() => {
    onStepCompleteRef.current = onStepComplete;
  }, [onStepComplete]);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  const clearSegmentTimer = useCallback(() => {
    if (segmentTimerRef.current) {
      clearInterval(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }
  }, []);

  const revealSubRef = useRef<{ remove: () => void } | null>(null);

  const revealLayer = useCallback(
    (nextKey: PetVideoKey, prevKey: PetVideoKey) => {
      if (prevKey !== nextKey) {
        players[prevKey].pause();
      }
      activeKeyRef.current = nextKey;
      setActiveKey(nextKey);
    },
    [players],
  );

  const shouldLoop = useCallback((config: PetVideoSegment) => {
    return loopRef.current || config.loop === true;
  }, []);

  const finishStep = useCallback((stepIndex: number) => {
    queueMicrotask(() => onStepCompleteRef.current?.(stepIndex));

    const steps = stepsRef.current;
    const nextIndex = stepIndex + 1;
    if (nextIndex < steps.length) {
      stepIndexRef.current = nextIndex;
      applySegmentRef.current(steps[nextIndex], nextIndex);
      return;
    }

    queueMicrotask(() => onCompleteRef.current?.());
  }, []);

  const watchSegmentEndForward = useCallback(
    (
      player: (typeof players)[PetVideoKey],
      config: PetVideoSegment,
      stepIndex: number,
    ) => {
      clearSegmentTimer();
      if (config.endMs === undefined) return;

      const startSec = (config.startMs ?? 0) / 1000;
      const endSec = config.endMs / 1000;
      const looping = shouldLoop(config);

      segmentTimerRef.current = setInterval(() => {
        if (activeKeyRef.current !== config.videoKey) return;
        if (player.currentTime < endSec - 0.05) return;

        if (looping) {
          player.currentTime = startSec;
          player.play();
          return;
        }

        player.pause();
        player.playbackRate = 1;
        clearSegmentTimer();
        finishStep(stepIndex);
      }, SEGMENT_POLL_MS);
    },
    [clearSegmentTimer, finishStep, shouldLoop],
  );

  const watchSegmentEndReverse = useCallback(
    (
      player: (typeof players)[PetVideoKey],
      config: PetVideoSegment,
      stepIndex: number,
    ) => {
      clearSegmentTimer();
      const startSec = (config.startMs ?? 0) / 1000;
      const endSec = config.endMs! / 1000;

      player.loop = false;
      player.playbackRate = 1;
      player.pause();
      player.currentTime = endSec;

      let reverseTime = endSec;

      segmentTimerRef.current = setInterval(() => {
        if (activeKeyRef.current !== config.videoKey) return;

        reverseTime -= REVERSE_STEP_SEC;
        if (reverseTime <= startSec) {
          player.currentTime = startSec;
          player.pause();
          clearSegmentTimer();
          finishStep(stepIndex);
          return;
        }

        player.currentTime = reverseTime;
      }, REVERSE_POLL_MS);
    },
    [clearSegmentTimer, finishStep],
  );

  const watchSegmentEnd = useCallback(
    (
      player: (typeof players)[PetVideoKey],
      config: PetVideoSegment,
      stepIndex: number,
    ) => {
      if (config.reverse) {
        watchSegmentEndReverse(player, config, stepIndex);
        return;
      }
      watchSegmentEndForward(player, config, stepIndex);
    },
    [watchSegmentEndForward, watchSegmentEndReverse],
  );

  const applySegment = useCallback(
    (config: PetVideoSegment, stepIndex: number) => {
      const nextKey = config.videoKey;
      const nextPlayer = players[nextKey];
      const prevKey = activeKeyRef.current;

      revealSubRef.current?.remove();
      revealSubRef.current = null;
      clearSegmentTimer();

      const startSec = (config.startMs ?? 0) / 1000;
      const endSec =
        config.endMs !== undefined ? config.endMs / 1000 : undefined;
      const looping = shouldLoop(config);
      const nativeLoop =
        !config.reverse &&
        looping &&
        (config.startMs ?? 0) === 0 &&
        config.endMs === undefined;

      nextPlayer.playbackRate = 1;
      nextPlayer.loop = nativeLoop;

      if (config.reverse && endSec !== undefined) {
        nextPlayer.currentTime = endSec;
        watchSegmentEnd(nextPlayer, config, stepIndex);
        revealLayer(nextKey, prevKey);
        return;
      }

      nextPlayer.currentTime = startSec;
      nextPlayer.play();
      watchSegmentEnd(nextPlayer, config, stepIndex);

      if (nextKey === prevKey) {
        revealLayer(nextKey, prevKey);
        return;
      }

      revealSubRef.current = nextPlayer.addListener(
        'playingChange',
        ({ isPlaying }) => {
          if (!isPlaying) return;
          revealSubRef.current?.remove();
          revealSubRef.current = null;
          revealLayer(nextKey, prevKey);
        },
      );
    },
    [clearSegmentTimer, players, revealLayer, shouldLoop, watchSegmentEnd],
  );

  applySegmentRef.current = applySegment;

  useEffect(() => {
    const steps = scenarioSteps ?? (segment ? [segment] : []);
    if (!readyRef.current) {
      readyRef.current = true;
    }
    if (steps.length === 0) return;

    stepsRef.current = steps;
    stepIndexRef.current = 0;
    applySegment(steps[0], 0);
  }, [applySegment, scenarioSteps, segment]);

  useEffect(() => {
    const subscriptions = PET_VIDEO_KEYS.map((key) =>
      players[key].addListener('playToEnd', () => {
        if (activeKeyRef.current !== key) return;

        const steps = stepsRef.current;
        const stepIndex = stepIndexRef.current;
        const config = steps[stepIndex];
        if (!config || config.endMs !== undefined || config.reverse) return;

        const startSec = (config.startMs ?? 0) / 1000;

        if (shouldLoop(config)) {
          players[key].currentTime = startSec;
          players[key].play();
          return;
        }

        if (!config.loop) {
          finishStep(stepIndex);
        }
      }),
    );

    return () => {
      revealSubRef.current?.remove();
      revealSubRef.current = null;
      clearSegmentTimer();
      subscriptions.forEach((sub) => sub.remove());
    };
  }, [clearSegmentTimer, finishStep, players, shouldLoop]);

  const content = (
    <View style={[styles.container, { width: size, height: size }]}>
      {PET_VIDEO_KEYS.map((key) => (
        <VideoView
          key={key}
          player={players[key]}
          style={[styles.videoLayer, { opacity: activeKey === key ? 1 : 0 }]}
          contentFit="contain"
          nativeControls={false}
          {...(Platform.OS === 'android' ? { surfaceType: 'textureView' } : {})}
        />
      ))}
    </View>
  );

  if (!onPress) {
    return content;
  }

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
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: GameColors.petVideoBg,
    borderRadius: moderateScale(12),
  },
  videoLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: GameColors.petVideoBg,
  },
});
