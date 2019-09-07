/* eslint-disable */

import stripHtmlTags from "../stripHtmlTags";

const MATRIX = [
  [``, ``],
  [`<h1>Header 1</h1>`, `Header 1`],
  [`<a href="https://example.com">Link</h1>`, `Link`],
  [`<img src="https://example.com"> Image Label`, ` Image Label`],
  [`<img src="https://example.com"/> Image Label`, ` Image Label`],
  [`<img src="https://example.com" /> Image Label`, ` Image Label`]
];

describe("helpers/stripHtmlTags()", () => {
  for (let [input, output] of MATRIX) {
    it(`\`${input}\` should return \`${output}\``, () => {
      expect(stripHtmlTags(input)).toStrictEqual(output);
    });
  }
});
