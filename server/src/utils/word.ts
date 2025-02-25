import fs from "fs";
import path from "path";
import { Languages } from "../types";

const WORDS_DIR = path.join(__dirname, "../../words");

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
  language: Languages
): Promise<string[]> {
  try {
    const words = await loadWords(language);
    if (words.length < n) {
      throw new Error(`Not enough words available in ${language}`);
    }

    return Array.from(
      { length: n },
      () => words[Math.floor(Math.random() * words.length)]
    );
  } catch (error) {
    throw error;
  }
}

// Convert phrase to underscores
export function convertToUnderscores(phrase: string): number[] {
  return phrase.split(" ").map((word) => word.length);
}
