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

  useEffect(() => {
    if (!playing) {
      setFrameIndex(0);
      return;
    }

    const animate = () => {
      // Random frame (excluding current frame for variation)
      setFrameIndex((prev) => {
        const availableFrames = Array.from({ length: frames }, (_, i) => i).filter(i => i !== prev);
        return availableFrames[Math.floor(Math.random() * availableFrames.length)];
      });
      
      // Random interval between 100-150ms
      const randomDelay = 100 + Math.random() * 50;
      return setTimeout(animate, randomDelay);
    };

    const timeoutId = animate();
    return () => clearTimeout(timeoutId);
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
