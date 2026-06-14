import { Video, type AVPlaybackStatus, ResizeMode } from 'expo-av';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { GameColors } from '@/constants/game';
import { getPetVideo, type PetVideoConfig } from '@/constants/pet-videos';
import type { PetMood } from '@/types/game';
import { moderateScale } from '@/utils/scale';

const DEFAULT_SIZE = 200;

type PetVideoAvatarProps = {
  mood: PetMood;
  size?: number;
  onAnimationComplete?: () => void;
  onPress?: () => void;
};

function isSameSource(a: PetVideoConfig, b: PetVideoConfig): boolean {
  return a.source === b.source;
}

async function applyConfig(ref: Video, config: PetVideoConfig) {
  const startMs = config.startMs ?? 0;
  const nativeLoop = config.loop && startMs === 0;
  await ref.setIsLoopingAsync(nativeLoop);
  await ref.setPositionAsync(startMs);
  await ref.playAsync();
}

export function PetVideoAvatar({
  mood,
  size = moderateScale(DEFAULT_SIZE),
  onAnimationComplete,
  onPress,
}: PetVideoAvatarProps) {
  const videoRef = useRef<Video>(null);
  const onCompleteRef = useRef(onAnimationComplete);
  const configRef = useRef(getPetVideo(mood));
  const moodRef = useRef(mood);
  const readyRef = useRef(false);

  const initialConfig = getPetVideo(mood);

  useEffect(() => {
    onCompleteRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  const switchMood = useCallback(async (nextMood: PetMood) => {
    const ref = videoRef.current;
    if (!ref || !readyRef.current) return;

    const prevConfig = configRef.current;
    const nextConfig = getPetVideo(nextMood);
    configRef.current = nextConfig;
    moodRef.current = nextMood;

    if (isSameSource(prevConfig, nextConfig)) {
      await applyConfig(ref, nextConfig);
      return;
    }

    const startMs = nextConfig.startMs ?? 0;
    await ref.unloadAsync();
    await ref.loadAsync(nextConfig.source, {
      positionMillis: startMs,
      shouldPlay: true,
      isLooping: nextConfig.loop && startMs === 0,
      isMuted: true,
    });
  }, []);

  useEffect(() => {
    if (moodRef.current === mood) return;
    switchMood(mood);
  }, [mood, switchMood]);

  const handleLoad = useCallback(async () => {
    readyRef.current = true;
    const ref = videoRef.current;
    if (!ref) return;
    await applyConfig(ref, configRef.current);
  }, []);

  const handlePlaybackStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    const config = configRef.current;
    const startMs = config.startMs ?? 0;

    if (config.loop && startMs > 0 && status.didJustFinish) {
      videoRef.current?.setPositionAsync(startMs).then(() => {
        videoRef.current?.playAsync();
      });
      return;
    }

    if (!config.loop && status.didJustFinish && !status.isLooping) {
      queueMicrotask(() => onCompleteRef.current?.());
    }
  };

  const content = (
    <View style={[styles.container, { width: size, height: size }]}>
      <Video
        ref={videoRef}
        source={initialConfig.source}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={false}
        isLooping={
          initialConfig.loop && (initialConfig.startMs ?? 0) === 0
        }
        isMuted
        onLoad={handleLoad}
        onPlaybackStatusUpdate={handlePlaybackStatus}
      />
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
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: GameColors.petVideoBg,
  },
});
