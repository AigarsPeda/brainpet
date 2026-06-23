import { useTranslation } from 'react-i18next';

import type { Puzzle } from '@/types/puzzle';

export function useTopicLabel(topic: Puzzle['topic']): string {
  const { t } = useTranslation();
  return t(`topic.${topic}`);
}
