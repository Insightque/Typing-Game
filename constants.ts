import { Character, DifficultyLevel, Language } from './types';

export const GAME_AREA_WIDTH = 640;
export const GAME_AREA_HEIGHT = 450;

export const INITIAL_FALL_SPEED = 0.5;
export const SPEED_INCREASE_FACTOR = 0.05;
export const INITIAL_WORD_INTERVAL_MS = 2000;
export const WORD_INTERVAL_DECREASE_FACTOR = 50;

export const MAX_WORDS_ON_SCREEN = 5;
export const WORD_GENERATION_BATCH_SIZE = 12;

export const INITIAL_DIFFICULTY: DifficultyLevel = DifficultyLevel.EASY;
export const INITIAL_LANGUAGE: Language = Language.ENGLISH;
export const INITIAL_HP = 5;

export const CHARACTER_HEIGHT = 120;
export const CHARACTER_WIDTH = 120;

export const SANRIO_CHARACTERS: Character[] = [
  { 
    id: 'kuromi-fairy', 
    name: 'Fairy Kuromi', 
    imageUrl: 'https://img.icons8.com/plasticine/200/kuromi.png' // 가장 안정적인 고품질 아이콘
  },
];

// Fairy Town Items (stable Icons8 URLs)
export const ITEM_IMAGES: string[] = [
  'https://img.icons8.com/fluency/96/fairy.png',
  'https://img.icons8.com/fluency/96/rainbow.png',
  'https://img.icons8.com/fluency/96/sparkling-diamond.png',
  'https://img.icons8.com/fluency/96/magic-wand.png',
  'https://img.icons8.com/fluency/96/cherry-blossom.png',
  'https://img.icons8.com/fluency/96/clover.png',
];

export const DIFFICULTY_CONFIG = {
  [DifficultyLevel.EASY]: {
    initialSpeed: 0.6,
    speedIncrement: 0.02,
    initialWordInterval: 2500,
    maxWordsOnScreen: 3,
    wordIntervalDecrement: 50,
    wordLengthRange: { min: 3, max: 5 },
  },
  [DifficultyLevel.MEDIUM]: {
    initialSpeed: 0.8,
    speedIncrement: 0.03,
    initialWordInterval: 2000,
    maxWordsOnScreen: 4,
    wordIntervalDecrement: 75,
    wordLengthRange: { min: 4, max: 7 },
  },
  [DifficultyLevel.HARD]: {
    initialSpeed: 1.2,
    speedIncrement: 0.05,
    initialWordInterval: 1500,
    maxWordsOnScreen: 5,
    wordIntervalDecrement: 100,
    wordLengthRange: { min: 5, max: 10 },
  },
};