import emojiRegex from "emoji-regex";

const regex = emojiRegex()

const removeEmojis = (str: string) => {
  return str.replace(regex, "");
};

const countEmojis = (str: string) => {
  return (str.match(regex) ?? []).length;
};

export const getCharCount = (str: string) => {
  // count emojis
  const emojiCount = countEmojis(str);
  // remove emojis
  str = removeEmojis(str);
  // add 2 chars for each emoji to character count
  // setCharCount(str.length + (emojiCount * 2));
  return str.length + (emojiCount * 2);
};
