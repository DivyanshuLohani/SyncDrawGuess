import fs from "fs";
import path from "path";
import { Languages } from "../types";

const WORDS_DIR = path.join(__dirname, "../../words");
const CUSTOM_WORDS_WEIGHT = 3;

// Cache words in memory
const wordsCache: Record<Languages, string[]> = {} as Record<
  Languages,
  string[]
>;

// Load words for a language
function loadWords(language: Languages): Promise<string[]> {
  return new Promise((resolve, reject) => {
    if (wordsCache[language]) {
      return resolve(wordsCache[language]);
    }

    const filePath = path.join(WORDS_DIR, `${language}.txt`);
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return reject(
          new Error(`Failed to load words for ${language}: ${err.message}`)
        );
      }

      const words = data
        .split("\n")
        .map((word) => word.trim())
        .filter(Boolean);
      if (words.length === 0) {
        return reject(new Error(`No words found in ${filePath}`));
      }

      wordsCache[language] = words;
      resolve(words);
    });
  });
}

// Function to get random words
export async function getRandomWords(
  n: number = 1,
  language: Languages,
  onlyCustomWords: boolean = false,
  customWords: string[] = []
): Promise<string[]> {
  try {
    let words: string[] = [];

    if (onlyCustomWords) {
      if (customWords.length < n) {
        throw new Error(`Not enough custom words provided`);
      }
      words = customWords;
    } else {
      const loadedWords = await loadWords(language);

      words = [
        ...loadedWords,
        ...Array(CUSTOM_WORDS_WEIGHT).fill(customWords).flat(),
      ];
      if (words.length < n) {
        throw new Error(`Not enough words available in ${language}`);
      }
    }

    // Shuffle the words array
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }

    // Return the first n words
    return words.slice(0, n);
  } catch (error) {
    throw error;
  }
}

// Convert phrase to underscores
export function convertToUnderscores(phrase: string): number[] {
  return phrase.split(" ").map((word) => word.length);
}
