import type { AutomergeUrl } from "@automerge/automerge-repo";

export type LocalTweet = {
  id: AutomergeUrl;
  createdAt: string;
  text: string;
};
