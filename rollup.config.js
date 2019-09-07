import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import json from "rollup-plugin-json";
import nodeResolve from "rollup-plugin-node-resolve";

export default {
  plugins: [
    // Import JSON files:
    json(),
    // Transpile Babel to ES6:
    babel({
      exclude: "./node_modules",
      runtimeHelpers: true
    }),
    // Convert CommonJS dependencies to ES2015:
    commonjs(),
    // Locate dependencies via node.js resolution algorithm:
    nodeResolve()
  ]
};
