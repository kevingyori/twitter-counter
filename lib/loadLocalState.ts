export function loadLocalContent(key: string) {
  const value = localStorage.getItem(key);
  const defaultValue =
    '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

  return value ?? defaultValue;
}
