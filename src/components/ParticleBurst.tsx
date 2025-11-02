import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  angle: number;
  distance: number;
}

interface ParticleBurstProps {
  x: number;
  y: number;
  onComplete: () => void;
}

export const ParticleBurst = ({ x, y, onComplete }: ParticleBurstProps) => {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i * 360) / 12,
      distance: 50 + Math.random() * 30,
    }))
  );

  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
              y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
              opacity: 0,
              scale: 0.5,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-full bg-yellow-400"
            style={{ left: -4, top: -4 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
