import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import CharacterSprite from "@/components/CharacterSprite";
import spriteSheet from "@/assets/sprite_animation_small.png";

function WebhookBubble() {
  const [text, setText] = useState<string>("");

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
          setText(t.trim() || "");
        }
      } catch (e) {
        console.error(e);
        setText("");
      }
    }

    fetchText();
    const id = setInterval(fetchText, 20000);
    return () => clearInterval(id);
  }, []);

  const isBubbleVisible = Boolean(text && text.trim());

  return (
    <>
      {/* Character Sprite */}
      <div className="fixed left-12 bottom-4 z-50">
        <CharacterSprite
          src={spriteSheet}
          frameW={300}
          frameH={305}
          frames={9}
          columns={3}
          fps={8}
          playing={isBubbleVisible}
        />
      </div>

      {/* Bubble - only render if text exists */}
      {isBubbleVisible && (
        <div className="fixed left-12 bottom-[325px] z-50 max-w-[240px]">
          <div className="relative bg-white text-black p-3 rounded-2xl shadow-lg border border-gray-200" style={{ wordWrap: "break-word" }}>
            {text}
            {/* Triangle tail pointing down */}
            <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
          </div>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <WebhookBubble />
  </React.StrictMode>
);
