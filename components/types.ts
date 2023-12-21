export type LocalTweet = {
  id: string;
  displayName: string;
  createdAt: string;
};

export type LocalTweets = Partial<LocalTweet>[];
