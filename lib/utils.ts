import { useState, useEffect } from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";

export function randomName() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
  });
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTweetName(tweetName: string) {
  // replace underscores with spaces and capitalize first letters
  if (!tweetName) return "";
  return tweetName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F,
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};
