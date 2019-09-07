export default function removeNodeChildren($node) {
  while ($node.firstChild) {
    $node.removeChild($node.firstChild);
  }
}
