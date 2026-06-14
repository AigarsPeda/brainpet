export type PetMood =
  | 'idle'
  | 'excited'
  | 'dancing'
  | 'eating'
  | 'angry'
  | 'sad'
  | 'sleeping';

export type PetType = 'dog' | 'cat';

export type PetStats = {
  hunger: number;
  happiness: number;
  level: number;
};

export type PetProfile = {
  type: PetType;
  name: string;
  stats: PetStats;
};

export type Wallet = {
  coins: number;
};

export type Progress = {
  streak: number;
};
