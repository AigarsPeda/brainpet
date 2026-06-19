import { ANIMATION_LABELS, ONE_SHOT_ANIMATIONS } from '@/constants/game';
import { getPetScenario } from '@/constants/pet-scenarios';
import { usePetVideoMood } from '@/hooks/use-pet-mood';
import type { PetAnimationState, PetProfile } from '@/types/game';
import type { PetAnimationScenario, PetVideoSegment } from '@/types/pet-animation';
import { moodToSegment } from '@/constants/pet-scenarios';
import { useCallback, useMemo, useState } from 'react';

type ActiveScenario = {
  scenario: PetAnimationScenario;
  thenMood: PetAnimationState | null;
};

export type PetPlaybackState =
  | { kind: 'scenario'; scenario: PetAnimationScenario; steps: PetVideoSegment[] }
  | { kind: 'segment'; segment: PetVideoSegment; mood: PetAnimationState };

export function usePetPlayback(pet: PetProfile) {
  const { mood: baseVideoMood, onFallAsleepComplete } = usePetVideoMood(pet);
  const [actionMood, setActionMood] = useState<PetAnimationState | null>(null);
  const [activeScenario, setActiveScenario] = useState<ActiveScenario | null>(
    null,
  );

  const playback = useMemo((): PetPlaybackState => {
    if (activeScenario) {
      return {
        kind: 'scenario',
        scenario: activeScenario.scenario,
        steps: activeScenario.scenario.steps,
      };
    }

    const mood = actionMood ?? baseVideoMood;
    return { kind: 'segment', segment: moodToSegment(mood), mood };
  }, [actionMood, activeScenario, baseVideoMood]);

  const displayLabel = useMemo(() => {
    if (playback.kind === 'scenario') {
      return playback.scenario.label;
    }
    return ANIMATION_LABELS[playback.mood];
  }, [playback]);

  const playAction = useCallback(
    (wasAsleep: boolean, mood: PetAnimationState) => {
      if (wasAsleep) {
        setActiveScenario({
          scenario: getPetScenario('wakeUp'),
          thenMood: mood,
        });
        return;
      }
      setActionMood(mood);
    },
    [],
  );

  const handleSegmentComplete = useCallback(
    (completedMood: PetAnimationState) => {
      if (activeScenario) {
        const thenMood = activeScenario.thenMood;
        setActiveScenario(null);
        if (thenMood) {
          setActionMood(thenMood);
        }
        return;
      }

      setActionMood((current) =>
        current && ONE_SHOT_ANIMATIONS.includes(current) ? null : current,
      );

      if (completedMood === 'fallingAsleep') {
        onFallAsleepComplete();
      }
    },
    [activeScenario, onFallAsleepComplete],
  );

  return {
    playback,
    displayLabel,
    baseVideoMood,
    playAction,
    setActionMood,
    handleSegmentComplete,
  };
}
