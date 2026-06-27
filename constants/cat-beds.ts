/** Cat bed items — assets in `assets/pets/Cat/CatItems/Beds/`. */
export const CAT_BED_SOURCES = {
  brown: require("@/assets/pets/Cat/CatItems/Beds/CatBedBrown.png"),
  green: require("@/assets/pets/Cat/CatItems/Beds/CatBedGreen.png"),
  blue: require("@/assets/pets/Cat/CatItems/Beds/CatBedBlue.png"),
  red: require("@/assets/pets/Cat/CatItems/Beds/CatBedRed.png"),
  pink: require("@/assets/pets/Cat/CatItems/Beds/CatBedPink.png"),
  purple: require("@/assets/pets/Cat/CatItems/Beds/CatBedPurple.png"),
} as const;

export type CatBedId = keyof typeof CAT_BED_SOURCES;

export const CAT_BED_IDS = Object.keys(CAT_BED_SOURCES) as CatBedId[];

export function isCatBedId(value: string): value is CatBedId {
  return value in CAT_BED_SOURCES;
}

export function resolveCatBedId(bedId: string | undefined): CatBedId | undefined {
  if (bedId && bedId in CAT_BED_SOURCES) {
    return bedId as CatBedId;
  }
  return undefined;
}

export function getCatBedSource(bedId: string | undefined): number | undefined {
  const resolved = resolveCatBedId(bedId);
  return resolved ? CAT_BED_SOURCES[resolved] : undefined;
}
