export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function removeQueryParameters(url) {
  const urlObj = new URL(url);
  urlObj.search = "";  // Clears the query parameters
  return urlObj.toString();
}