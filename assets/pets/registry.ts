import { dogManifest } from '@/assets/pets/dog/manifest';
import type { PetSpriteManifest } from '@/types/sprite-sheet';

export const PET_REGISTRY: Record<string, PetSpriteManifest> = {
  dog: dogManifest,
};

export const DEFAULT_PET_ID = 'dog';

export function getPetManifest(petId: string): PetSpriteManifest {
  const manifest = PET_REGISTRY[petId];
  if (!manifest) {
    throw new Error(`Unknown pet manifest: ${petId}`);
  }
  return manifest;
}
