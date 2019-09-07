import copy from "rollup-plugin-copy";
import filesize from "rollup-plugin-filesize";
import { terser } from "rollup-plugin-terser";

import commonConfig from "./rollup.config";

const { NODE_ENV } = process.env;

export default {
  ...commonConfig,

  input: "src/background/index.js",

  output: [
    {
      file: "./dist/background.js",
      format: "iife"
    }
  ],

  plugins: [
    ...commonConfig.plugins,

    // Copy asset, localization and manifest files:
    copy({
      targets: [
        { src: "./_locales", dest: "./dist" },
        { src: "./icons", dest: "./dist" },
        { src: "./manifest.json", dest: "./dist" }
      ]
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
