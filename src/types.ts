export interface GameState {
  fen: string;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  turn: 'w' | 'b';
}

export interface Score {
  player: number;
  ai: number;
}

export interface Timer {
  minutes: number;
  seconds: number;
}

export interface Move {
  from: string;
  to: string;
  promotion?: string;
}