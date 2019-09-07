export default function stripHtmlTags(source) {
  return source
    .replace(/(.*)<span data-emoticon="([^"]+)">(.*)/g, "$1:$2:<span>$3")
    .replace(/<[^>]*>/g, "");
}
