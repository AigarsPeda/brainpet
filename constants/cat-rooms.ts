/** Cat room backgrounds — all assets in `assets/pets/Cat/CatItems/Rooms/`. */
export const CAT_ROOM_SOURCES = {
  room1: require("@/assets/pets/Cat/CatItems/Rooms/Room1.png"),
  room2: require("@/assets/pets/Cat/CatItems/Rooms/Room2.png"),
  room3: require("@/assets/pets/Cat/CatItems/Rooms/Room3.png"),
  room4: require("@/assets/pets/Cat/CatItems/Rooms/Room4.png"),
  room5: require("@/assets/pets/Cat/CatItems/Rooms/Room5.png"),
  room6: require("@/assets/pets/Cat/CatItems/Rooms/Room6.png"),
  room7: require("@/assets/pets/Cat/CatItems/Rooms/Room7.png"),
  room8: require("@/assets/pets/Cat/CatItems/Rooms/Room8.png"),
  room9: require("@/assets/pets/Cat/CatItems/Rooms/Room9.png"),
  room10: require("@/assets/pets/Cat/CatItems/Rooms/Room10.png"),
  room11: require("@/assets/pets/Cat/CatItems/Rooms/Room11.png"),
  room12: require("@/assets/pets/Cat/CatItems/Rooms/Room12.png"),
  room13: require("@/assets/pets/Cat/CatItems/Rooms/Room13.png"),
  room14: require("@/assets/pets/Cat/CatItems/Rooms/Room14.png"),
  room15: require("@/assets/pets/Cat/CatItems/Rooms/Room15.png"),
} as const;

export type CatRoomId = keyof typeof CAT_ROOM_SOURCES;

export const CAT_ROOM_IDS = Object.keys(CAT_ROOM_SOURCES) as CatRoomId[];

export const DEFAULT_CAT_ROOM_ID: CatRoomId = "room1";

export function resolveCatRoomId(roomId: string | undefined): CatRoomId {
  if (roomId && roomId in CAT_ROOM_SOURCES) {
    return roomId as CatRoomId;
  }
  return DEFAULT_CAT_ROOM_ID;
}

export function getCatRoomSource(roomId: string | undefined): number {
  return CAT_ROOM_SOURCES[resolveCatRoomId(roomId)];
}

export function isCatRoomId(value: string): value is CatRoomId {
  return value in CAT_ROOM_SOURCES;
}
