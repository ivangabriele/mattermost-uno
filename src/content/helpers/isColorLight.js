/* eslint-disable no-bitwise */

/**
 * @see https://awik.io/determine-color-bright-dark-using-javascript/
 */
export default function isColorLight(color) {
  // Variables for red, green and blue values:
  let r;
  let g;
  let b;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If the color is in HEX, we store the red, green, blue values in separate variables:
    const colors = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

    [, r, g, b] = colors;
  } else {
    // If the color is in RGB, we convert it to HEX:
    // http://gist.github.com/983661
    const colors = +`0x${color.slice(1).replace(color.length < 5 && /./g, "$&$&")}`;

    r = colors >> 16;
    g = (colors >> 8) & 255;
    b = colors & 255;
  }

  // HSP (Highly Sensitive Poo) equation:
  // http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, we can determine whether the color is light or dark:
  return hsp > 127.5;
}
