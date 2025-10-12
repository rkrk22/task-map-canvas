// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <div className="fixed left-4 bottom-4 bg-white p-3 rounded-2xl shadow-lg z-50 rounded-2xl">
      Тестовый бабл
    </div>
  </React.StrictMode>
);
