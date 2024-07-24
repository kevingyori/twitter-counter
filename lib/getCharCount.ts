import emojiRegex from "emoji-regex";
import { URL_REGEX } from "./constants";

const EMOJI_REGEX = emojiRegex();

const removeEmojis = (str: string) => {
	return str.replace(EMOJI_REGEX, "");
};

const countEmojis = (str: string) => {
	return (str.match(EMOJI_REGEX) ?? []).length;
};

const removeUrls = (str: string) => {
	return str.replace(URL_REGEX, "");
};

const countUrls = (str: string) => {
	return (str.match(URL_REGEX) ?? []).length;
};

export const getCharCount = (str: string) => {
	// count emojis and urls
	const emojiCount = countEmojis(str);
	const urlCount = countUrls(str);

	// remove emojis and urls
	str = removeEmojis(str);
	str = removeUrls(str);

	// add 2 chars for each emoji and 23 chars for each url to the length
	return str.length + emojiCount * 2 + urlCount * 23;
};
