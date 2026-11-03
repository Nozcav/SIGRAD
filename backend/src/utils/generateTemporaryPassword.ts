import { randomInt } from "node:crypto";

const UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";
const ALPHABET = `${UPPERCASE}${LOWERCASE}${DIGITS}`;
const PASSWORD_LENGTH = 10;

const pickRandom = (characters: string): string => characters[randomInt(0, characters.length)];

export const generateTemporaryPassword = (): string => {
  const characters = [
    pickRandom(UPPERCASE),
    pickRandom(LOWERCASE),
    pickRandom(DIGITS),
  ];

  while (characters.length < PASSWORD_LENGTH) {
    characters.push(pickRandom(ALPHABET));
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }

  return characters.join("");
};
