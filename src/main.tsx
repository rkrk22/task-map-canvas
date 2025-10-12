import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

function WebhookBubble() {
  const [text, setText] = useState("Загрузка...");

  useEffect(() => {
    async function fetchText() {
      try {
        const res = await fetch("https://n8n-my35.onrender.com/webhook/assistant-bubble");
        if (!res.ok) throw new Error("Ошибка запроса");
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          setText(data.message || data.text || JSON.stringify(data));
        } else {
          const t = await res.text();
          setText(t.trim() || "Пустой ответ");
        }
      } catch (e) {
        console.error(e);
        setText("Ошибка загрузки");
      }
    }

    fetchText();
    const id = setInterval(fetchText, 20000); // обновление каждые 20 сек
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed left-4 bottom-4 bg-white text-black p-3 rounded-2xl shadow-lg z-50 border border-gray-200">
      {text}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <WebhookBubble />
  </React.StrictMode>
);
