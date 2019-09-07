export default function themize(source) {
  return source
    .replace(/[^\s\w-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
