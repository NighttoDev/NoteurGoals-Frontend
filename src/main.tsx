import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Install earliest alert shim so any alert before providers mount will be queued and shown as toast later
(function installEarlyAlertShim(){
  const w = window as any;
  if (!w.__rv_alertShimInstalled) {
    w.__rv_alertShimInstalled = true;
    w.__rv_alertQueue = [] as Array<{ message: string }>;
    const original = w.alert;
    w.__rv_originalAlert = original;
    w.alert = (message?: any) => {
      try {
        const text = typeof message === 'string' ? message : String(message);
        if (Array.isArray(w.__rv_alertQueue)) {
          w.__rv_alertQueue.push({ message: text });
        } else {
          console.log('[toast-queue]', text);
        }
      } catch (e) {
        console.log('[toast-queue]', message);
      }
    };
  }
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
