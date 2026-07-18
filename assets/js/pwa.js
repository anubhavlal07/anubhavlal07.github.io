/**
 * Registers the service worker so the portfolio is installable and works
 * offline. Registration is deferred to `load` so it never competes with the
 * initial render, and failures are non-fatal.
 */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}
