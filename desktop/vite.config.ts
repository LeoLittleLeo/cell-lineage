import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@domain": path.resolve(import.meta.dirname, "../app/domain"),
      "@hooks": path.resolve(import.meta.dirname, "../app/hooks"),
    },
  },
  server: {
    strictPort: true,
    fs: { allow: [path.resolve(import.meta.dirname, ".."), path.resolve(import.meta.dirname, ".")] },
  },
  build: { outDir: "dist", emptyOutDir: true },
});
