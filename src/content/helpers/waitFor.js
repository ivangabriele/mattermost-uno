export default function waitFor(inMs) {
  return new Promise(resolve => setTimeout(resolve, inMs));
}
