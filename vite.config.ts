import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

const __dirname = new URL(".", import.meta.url).pathname;

export default defineConfig({
  plugins: [
    vue(),
    dts(),
    visualizer({
      filename: "./stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "/@/": new URL("./src/", import.meta.url).pathname,
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "./src/index.ts"),
      name: "@silverbuff/sv-table",
      fileName: (format) =>
        `sv-table.${format === "es" ? "mjs" : format + ".js"}`,
      formats: ["es", "umd"],
    },
    sourcemap: true,
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
        },
        exports: "named",
      },
    },
  },
  css: {
    devSourcemap: true,
  },
});
