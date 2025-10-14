import { useEffect, useRef, useState } from "react";

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

  // Храним ТОЛЬКО один активный таймер
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Всегда чистим висящий таймер при входе в эффект
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!playing) {
      setFrameIndex(0); // стоп на первом кадре
      return;
    }

    const animate = () => {
      // следующий кадр (отличный от текущего)
      setFrameIndex((prev) => {
        const available = Array.from({ length: frames }, (_, i) => i).filter(i => i !== prev);
        return available[Math.floor(Math.random() * available.length)];
      });

      const delay = 100 + Math.random() * 50;
      timeoutRef.current = window.setTimeout(animate, delay);
    };

    animate();

    // Чистка при выключении playing/размонтировании
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
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
        position: "relative",
      }}
    >
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundImage: `url(${src})`,
          backgroundPosition: `-${col * width}px -${row * height}px`,
          backgroundSize: `${columns * width}px ${Math.ceil(frames / columns) * height}px`,
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
}
