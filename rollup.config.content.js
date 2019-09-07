import copy from "rollup-plugin-copy";
import filesize from "rollup-plugin-filesize";
import { terser } from "rollup-plugin-terser";

import commonConfig from "./rollup.config";

const { NODE_ENV } = process.env;

export default {
  input: "src/content/index.js",

  output: [
    {
      file: "./dist/content.js",
      format: "iife"
    }
  ],

  plugins: [
    ...commonConfig.plugins,

    // Copy stylesheet:
    copy({
      targets: [{ src: "./src/content/content.css", dest: "./dist" }]
    }),

    ...(NODE_ENV !== "development"
      ? [
          // Minify source:
          terser(),
          // Calculate output bundle size:
          filesize()
        ]
      : [])
  ]
};
