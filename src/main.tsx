import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// HashRouter (not BrowserRouter) is deliberate: this app is designed to be
// deployable as a static site with zero server config — GitHub Pages,
// Netlify's default static mode, opening dist/index.html directly, etc.
// A "/#/mock/run"-style URL never gets sent to the server on refresh/deep
// link, so there's no SPA-fallback/rewrite rule to configure anywhere.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    // import.meta.env.BASE_URL (from vite.config.ts's `base`) so this still
    // finds sw.js correctly when hosted under a subpath, e.g. GitHub Pages'
    // https://user.github.io/repo-name/.
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch((err) => console.error("Service worker registration failed:", err));
  });
}
