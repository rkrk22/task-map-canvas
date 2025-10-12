import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("BUBBLE: mount start");

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <div
      data-testid="bubble"
      className="fixed left-4 bottom-4 z-[999999] bg-white text-black p-3 rounded-2xl shadow-lg border border-black/10"
    >
      Тестовый бабл
    </div>
  </React.StrictMode>
);

console.log("BUBBLE: rendered");
