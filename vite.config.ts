import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// VITE_BASE_PATH lets a CI workflow (see .github/workflows/deploy.yml) build
// this for a GitHub Pages *project* site — served from
// https://<user>.github.io/<repo-name>/, not the domain root — without
// anyone having to hand-edit this file. Locally (npm run dev / a plain
// `npm run build` for your own server) it defaults to "/", i.e. no change
// in behaviour from before.
const base = process.env.VITE_BASE_PATH || "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
