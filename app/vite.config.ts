import * as url from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "",
  build: {
    rolldownOptions: {
      treeshake: {
        moduleSideEffects: [{ test: /puzlink/, sideEffects: false }],
      },
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          ["babel-plugin-react-compiler"],
          ["@babel/plugin-proposal-decorators", { version: "2023-11" }],
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      puzlink: url.fileURLToPath(new URL("../src/index.ts", import.meta.url)),
    },
  },
});
