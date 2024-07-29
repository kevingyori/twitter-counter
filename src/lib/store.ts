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
  undoDelete: (id: string) => void;
  trash: LocalTweet[];
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
      deleteTweet: (id) => {
        // move tweet to trash before deleting (max 5 tweets in trash)
        const tweet = get().allTweets.find((t) => t.id === id);
        const trash = get().trash;
        if (tweet) {
          if (trash.length >= 5) {
            trash.shift();
          }
          set((state) => ({
            trash: [...state.trash, tweet],
          }));
        }

        set((state) => ({
          allTweets: state.allTweets.filter((t) => t.id !== id),
        }));
      },
      undoDelete: (id) => {
        const tweet = get().trash.find((t) => t.id === id);
        if (tweet) {
          set((state) => ({
            allTweets: [...state.allTweets, tweet],
            trash: state.trash.filter((t) => t.id !== id),
          }));
        }
      },
      trash: [],
    }),
    {
      name: "tweet-store",
      version: 1,
    },
  ),
);
