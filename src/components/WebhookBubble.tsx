import { useEffect, useRef, useState } from "react";
import spriteSheet from "@/assets/sprite_animation_small_2.png";
import CharacterSprite from "@/components/CharacterSprite";
import { Loader2 } from "lucide-react";

export default function WebhookBubble() {
  const [text, setText] = useState("");
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Храним один активный таймер скрытия баббла
  const hideTimerRef = useRef<number | null>(null);

  // Чистим таймер при размонтировании
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

  const restartHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      setIsBubbleVisible(false);
      hideTimerRef.current = null;
    }, 12000);
  };

  const handleCharacterClick = async () => {
    if (isLoading) return;                // защита от даблклика во время загрузки
    setIsLoading(true);
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
      setIsLoading(false);

      // показываем баббл и перезапускаем 12с-таймер
      setIsBubbleVisible(true);
      restartHideTimer();
    } catch (e) {
      console.error(e);
      setText("");
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <>
      <div
        id="character-drop-zone"
        className="fixed left-12 bottom-4 z-50 cursor-pointer"
        onClick={handleCharacterClick}
        onDragOver={handleDragOver}
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

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed left-12 bottom-32 z-50">
          <div className="bg-white p-3 rounded-full shadow-lg border border-gray-200">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </div>
      )}

      {/* Bubble */}
      {isBubbleVisible && !isLoading && (
        <div className="fixed left-12 bottom-32 z-50 max-w-[240px]">
          <div
            className="relative bg-white text-black p-3 rounded-2xl shadow-lg border border-gray-200"
            style={{ wordWrap: "break-word" }}
          >
            {text}
            <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
          </div>
        </div>
      )}
    </>
  );
}
