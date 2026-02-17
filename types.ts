export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYED',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum Language {
  ENGLISH = 'ENGLISH',
  KOREAN = 'KOREAN',
}

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Word {
  id: string;
  text: string;
  top: number; // Y-position for falling animation
  left: number; // X-position for falling animation
  speed: number; // Pixels per frame
  itemImageUrl: string; // URL for the item associated with the word
}

export interface GameStats {
  wordsTyped: number;
  correctWords: number;
  incorrectWords: number;
  typingSpeedWPM: number;
  accuracy: number;
  startTime: number | null;
  totalTypedCharacters: number;
  currentHp: number; // Added for the new HP system
}

export interface HpLossIndicator {
  id: string;
  top: number;
  left: number;
  timestamp: number;
}