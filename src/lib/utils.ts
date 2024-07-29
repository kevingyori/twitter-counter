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

export function formatDate(date: string) {
  return new Date(Number(date)).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function truncate(str: string, n: number) {
  return str.length > n ? `${str.slice(0, n)}...` : str;
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
