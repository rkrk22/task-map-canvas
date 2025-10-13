import { useEffect, useRef, useState } from "react";

interface CharacterSpriteProps {
  src: string;
  frameW: number;
  frameH: number;
  frames: number;
  columns: number;
  fps: number;
  playing: boolean;
}

export default function CharacterSprite({
  src,
  frameW,
  frameH,
  frames,
  columns,
  fps,
  playing,
}: CharacterSpriteProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const animationRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) {
      setFrameIndex(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const getRandomDuration = () => 100 + Math.random() * 50; // 100-150ms

    const animate = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastFrameTimeRef.current;
      const frameDuration = getRandomDuration();

      if (elapsed >= frameDuration) {
        setFrameIndex(Math.floor(Math.random() * frames)); // Random frame
        lastFrameTimeRef.current = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      lastFrameTimeRef.current = 0;
    };
  }, [playing, frames]);

  const row = Math.floor(frameIndex / columns);
  const col = frameIndex % columns;
  const offsetX = -col * frameW;
  const offsetY = -row * frameH;

  return (
    <div
      className="overflow-hidden"
      style={{
        width: `${frameW}px`,
        height: `${frameH}px`,
      }}
    >
      <div
        style={{
          backgroundImage: `url(${src})`,
          backgroundPosition: `${offsetX}px ${offsetY}px`,
          backgroundRepeat: "no-repeat",
          width: `${frameW}px`,
          height: `${frameH}px`,
        }}
      />
    </div>
  );
}
