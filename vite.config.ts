import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

const aliases = ["components", "components/ui", "lib", "src"];

// https://vitejs.dev/config/
export default defineConfig({
  // resolve: {
  //   alias: aliases.map((alias) => {
  //     return {
  //       find: `@${alias}`,
  //       replacement: path.resolve(__dirname, `src/${alias}`),
  //     };
  //   }),
  // },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // This is necessary because otherwise `vite dev` includes two separate
    // versions of the JS wrapper. This causes problems because the JS
    // wrapper has a module level variable to track JS side heap
    // allocations, and initializing this twice causes horrible breakage
    exclude: [
      "@automerge/automerge-wasm",
      "@automerge/automerge-wasm/bundler/bindgen_bg.wasm",
      "@syntect/wasm",
    ],
  },
  plugins: [tsconfigPaths(), wasm(), topLevelAwait(), react()],
});
