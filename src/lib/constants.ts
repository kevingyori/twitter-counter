import urlRegex from "url-regex";

const PLACEHOLDER = "What is happening?!";
const URL_REGEX = urlRegex({ strict: false, exact: false });

export { PLACEHOLDER, URL_REGEX };
