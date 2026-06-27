/** How a store item is priced — swap `coins` for `iap` per room when ready. */
export type StorePrice =
  | { kind: "free" }
  | { kind: "coins"; amount: number }
  | { kind: "iap"; productId: string };

export type RoomPurchaseResult =
  | "purchased"
  | "already_owned"
  | "insufficient_funds"
  | "not_for_sale"
  | "invalid_room";
