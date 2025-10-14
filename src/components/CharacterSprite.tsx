import { useEffect, useState, useRef } from "react";

interface CharacterSpriteProps {
  src: string;
  frameW: number;
  frameH: number;
  frames: number;
  columns: number;
  height: number;
  playing: boolean;
}

export default function CharacterSprite({
  src,
  frameW,
  frameH,
  frames,
  columns,
  height,
  playing,
}: CharacterSpriteProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const aspectRatio = frameW / frameH;
  const width = height * aspectRatio;
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Когда анимация выключается — сбрасываем кадр и очищаем таймер
    if (!playing) {
      setFrameIndex(0);
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const animate = () => {
      // Выбираем случайный кадр, отличный от текущего
      setFrameIndex((prev) => {
        const availableFrames = Array.from({ length: frames }, (_, i) => i).filter((i) => i !== prev);
        return availableFrames[Math.floor(Math.random() * availableFrames.length)];
      });

      // Случайная задержка между кадрами
      const randomDelay = 100 + Math.random() * 50;
      timeoutRef.current = window.setTimeout(animate, randomDelay);
    };

    animate();

    // Очистка при размонтировании или смене состояния
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [playing, frames]);

  const row = Math.floor(frameIndex / columns);
  const col = frameIndex % columns;

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative`,
      }}
    >
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundImage: `url(${src})`,
          backgroundPosition: `-${col * width}px -${row * height}px`,
          backgroundSize: `${columns * width}px ${Math.ceil(frames / columns) * height}px`,
          backgroundRepeat: "no-repeat`,
        }}
      />
    </div>
  );
}
