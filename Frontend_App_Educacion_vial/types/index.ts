export interface Question {
  id: string;
  q: string;
  options: string[];
  answer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Player {
  id: string;
  socketId: string;
  name: string;
  score: number;
  time: number;
  isReady: boolean;
  isHost: boolean;
  answers: {
    questionIndex: number;
    answer: number;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}

export type GameState = 'waiting' | 'starting' | 'in_progress' | 'finished';

export interface GameResult {
  id: string;
  name: string;
  score: number;
  time: number;
  isReady: boolean;
  isCurrentPlayer: boolean;
}
