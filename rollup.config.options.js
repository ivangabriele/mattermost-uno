import copy from "rollup-plugin-copy";
import filesize from "rollup-plugin-filesize";

import commonConfig from "./rollup.config";

const { NODE_ENV } = process.env;

export default {
  input: "src/options/options.js",

  output: [
    {
      file: "./dist/options.js",
      format: "iife",
    },
  ],

  plugins: [
    ...commonConfig.plugins,

    // Copy stylesheet:
    copy({
      targets: [{ src: "./src/options/options.html", dest: "./dist" }],
    }),

    ...(NODE_ENV !== "development"
      ? [
          // Calculate output bundle size:
          filesize(),
        ]
      : []),
  ],
};
