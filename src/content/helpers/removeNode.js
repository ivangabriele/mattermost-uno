export default function removeNode($node) {
  if ($node.parentNode === null) {
    throw new Error("helpers/removeNode(): The parent node is null.");
  }

  $node.parentNode.removeChild($node);
}
