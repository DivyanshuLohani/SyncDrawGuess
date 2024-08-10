import fs from "fs";
import path from "path";

const WORDS_FILE_PATH = path.join(__dirname, "../words.txt");

// Function to read the file and return a random word
export function getRandomWords(n: number = 1): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readFile(WORDS_FILE_PATH, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      // Split the file content into lines
      const words = data
        .split("\n")
        .map((word) => word.trim())
        .filter((word) => word.length > 0);

      if (words.length === 0) {
        reject(new Error("No words found in the file"));
        return;
      }

      let randomWords: string[] = [];
      for (let i = 0; i < n; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        const randomWord = words[randomIndex];
        randomWords.push(randomWord);
      }

      // Pick a random word
      resolve(randomWords);
    });
  });
}
export function convertToUnderscores(phrase) {
  const words = phrase.split(" ");
  const underscores = words.map((word) => {
    return word
      .split("")
      .map(() => "_")
      .join(" ");
  });
  return underscores.join("   ");
}
