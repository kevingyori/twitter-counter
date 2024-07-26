import { create } from "zustand";
import type { LocalTweet } from "./types";
import { persist } from "zustand/middleware";

export type Store = {
  allTweets: LocalTweet[];
  currentTweetId: string;
  setCurrentTweetId: (id: string) => void;
  createTweet: (tweet: LocalTweet) => void;
  updateTweet: (id: string, tweet: Partial<LocalTweet>) => void;
  deleteTweet: (id: string) => void;
};

export const useTweetStore = create<Store>()(
  persist(
    (set, get) => ({
      allTweets: [],
      currentTweetId: "",
      setCurrentTweetId: (id) => set({ currentTweetId: id }),
      createTweet: (tweet) =>
        set((state) => ({
          allTweets: [...state.allTweets, tweet],
        })),
      updateTweet: (id, tweet) =>
        set((state) => ({
          allTweets: state.allTweets.map((t) =>
            t.id === id ? { ...t, ...tweet } : t,
          ),
        })),
      deleteTweet: (id) =>
        set((state) => ({
          allTweets: state.allTweets.filter((t) => t.id !== id),
        })),
    }),
    {
      name: "tweet-store",
      version: 1,
    },
  ),
);
