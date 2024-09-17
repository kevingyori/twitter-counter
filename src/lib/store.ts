import {
  type AutomergeUrl,
  type Repo,
  updateText,
} from "@automerge/automerge-repo";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LocalTweet } from "./types";
import { getHeads } from "@automerge/automerge/next";

export type Store = {
  allTweets: LocalTweet[];
  currentTweetId: AutomergeUrl;
  setCurrentTweetId: (id: AutomergeUrl) => void;
  createTweet: (repo: Repo) => AutomergeUrl;
  updateTweet: (id: AutomergeUrl, text: string, repo: Repo) => void;
  deleteTweet: (id: AutomergeUrl) => void;
  undoDelete: (id: AutomergeUrl) => void;
  trash: LocalTweet[];
  // allsheads example {tweetId: {timestamp: headHash}}
  allHeads: { [key: string]: { [timestamp: string]: string } };
};

export const useTweetStore = create<Store>()(
  persist(
    (set, get) => ({
      allTweets: [],
      currentTweetId: "",
      setCurrentTweetId: (id) => set({ currentTweetId: id }),
      createTweet: (repo) => {
        const handle = repo.create({ text: "" });
        const tweet = {
          id: handle.url,
          text: "",
          createdAt: new Date().getTime().toString(),
        };
        set((state) => ({
          allTweets: [...state.allTweets, tweet],
        }));
        return handle.url;
      },
      updateTweet: (id, text, repo) => {
        const docHandle = repo.find(id);
        if (docHandle.isReady()) {
          // console.log(docHandle);
          docHandle.change((doc) => {
            updateText(doc, ["text"], text);
            // console.log(getHeads(doc));
            set((state) => ({
              allHeads: {
                ...state.allHeads,
                [id]: { [Date.now()]: getHeads(doc)[0] },
              },
            }));

            console.log("allheads: ", get().allHeads);
            // doc.pastHeads.push(getHeads(doc)[0]);
            // doc.pastHeads.push(getHeads(doc));
            // console.log(doc.text);
          });
        }
        const tweet = {
          text,
        };

        set((state) => ({
          allTweets: state.allTweets.map((t) =>
            t.id === id ? { ...t, ...tweet } : t,
          ),
        }));
      },
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
      allHeads: {},
    }),
    {
      name: "tweet-store",
      version: 1,
    },
  ),
);
