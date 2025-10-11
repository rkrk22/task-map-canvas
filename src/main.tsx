import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import MessageBubble from "./components/hooks/MessageBubble"; // ← путь

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <MessageBubble url={import.meta.env.VITE_N8N_WEBHOOK_URL} />
  </React.StrictMode>
);
