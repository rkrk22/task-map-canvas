import { useEffect, useState } from "react";
import spriteSheet from "@/assets/sprite_animation_small_2.png";
import CharacterSprite from "@/components/CharacterSprite";

export default function WebhookBubble() {
  const [text, setText] = useState("");
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);

  const handleCharacterClick = async () => {
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
      setIsBubbleVisible(true);
    } catch (e) {
      console.error(e);
      setText("");
    }
  };

  useEffect(() => {
    if (isBubbleVisible) {
      const timer = setTimeout(() => {
        setIsBubbleVisible(false);
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [isBubbleVisible]);

  return (
    <>
      {/* Character */}
      <div 
        className="fixed left-12 bottom-4 z-50 cursor-pointer" 
        onClick={handleCharacterClick}
      >
        <CharacterSprite
          src={spriteSheet}
          frameW={267}
          frameH={272}
          frames={9}
          columns={3}
          height={120}
          playing={isBubbleVisible}
        />
      </div>

      {/* Bubble */}
      {isBubbleVisible && (
        <div className="fixed left-12 bottom-32 z-50 max-w-[240px]">
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
