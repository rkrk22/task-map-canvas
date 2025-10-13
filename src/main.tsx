import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import characterImage from "@/assets/character.png";

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
    <>
      {/* Character */}
      <div className="fixed left-12 bottom-4 z-50">
        <img src={characterImage} alt="Assistant character" className="h-[120px] w-auto" />
      </div>

      {/* Bubble */}
      <div className="fixed left-4 bottom-32 z-50 max-w-[240px]">
        <div className="relative bg-white text-black p-3 rounded-2xl shadow-lg border border-gray-200" style={{ wordWrap: "break-word" }}>
          {text}
          {/* Triangle tail pointing down */}
          <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
        </div>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <WebhookBubble />
  </React.StrictMode>
);
