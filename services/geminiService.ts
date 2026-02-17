// This file is no longer used for word generation in the application.
// Words are loaded from public/words.json via services/wordService.ts

import { Language } from '../types';

/**
 * (DEPRECATED for word generation, words are now loaded from local JSON)
 * This function previously called the Gemini API to generate words but is no longer
 * actively used in the Sanrio Typing Game. Words are now sourced from a local JSON file.
 *
 * @param language The desired language for the words (English or Korean).
 * @param count The number of words to generate.
 * @param minLength Minimum length of words.
 * @param maxLength Maximum length of words.
 * @returns A promise that resolves to an array of generated words.
 */
export async function generateWords(
  language: Language,
  count: number,
  minLength: number,
  maxLength: number,
): Promise<string[]> {
  console.warn("generateWords function (using Gemini API) is deprecated and not used for word generation in the current application. Words are loaded from local JSON.");

  // This block is for demonstration or potential future fallback, but not currently active.
  // In a real scenario, you'd handle this more robustly if API was truly optional.
  if (language === Language.ENGLISH) {
    return ["apple", "banana", "cat", "dog", "elephant", "flower", "grape", "house", "ice", "juice"].slice(0, count);
  } else {
    return ["사과", "바나나", "고양이", "개", "코끼리", "꽃", "포도", "집", "얼음", "주스"].slice(0, count);
  }
}