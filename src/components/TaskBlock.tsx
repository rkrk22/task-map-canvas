import { motion } from "framer-motion";
import { Trash2, Calendar, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";

interface TaskBlockProps {
  id: string;
  title: string;
  deadline: string;
  importance: number;
  size: number;
  status?: string;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export const TaskBlock = ({
  id,
  title,
  deadline,
  importance,
  size,
  status = "in_progress",
  onClick,
  onDelete,
}: TaskBlockProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const startPosRef = useState({ x: 0, y: 0 })[0];
  const baseSize = 60;
  // Increase base size for low importance tasks (1/10)
  const importanceBoost = importance === 1 ? 15 : 0;
  const scaledSize = baseSize + importanceBoost + (size * 15);
  
  // Dynamic font sizes based on card size
  const titleFontSize = Math.max(10, Math.min(scaledSize / 8, 16));
  const detailFontSize = Math.max(8, Math.min(scaledSize / 12, 12));
  const iconSize = Math.max(10, Math.min(scaledSize / 15, 14));
  const padding = Math.max(8, Math.min(scaledSize / 10, 16));
  
  // Map importance to gradient colors (1-6 to match reference palette)
  const gradientIndex = Math.min(6, Math.max(1, Math.ceil((importance / 10) * 6)));

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only left click
    e.preventDefault();
    e.stopPropagation();
    
    setIsPointerDown(true);
    startPosRef.x = e.clientX;
    startPosRef.y = e.clientY;
    setPosition({ x: e.clientX, y: e.clientY });
    setHasMoved(false);
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown) return;
    e.preventDefault();
    
    const deltaX = Math.abs(e.clientX - startPosRef.x);
    const deltaY = Math.abs(e.clientY - startPosRef.y);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Start dragging only after moving at least 10px
    if (!hasMoved && distance > 10) {
      setHasMoved(true);
      setIsDragging(true);
    }
    
    if (isDragging) {
      setPosition({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDown) return;
    e.preventDefault();

    // If we actually dragged, check if dropped on character
    if (isDragging && hasMoved) {
      const characterEl = document.getElementById("character-drop-zone");
      if (characterEl) {
        const rect = characterEl.getBoundingClientRect();
        const isOverCharacter =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;

        if (isOverCharacter) {
          window.dispatchEvent(new CustomEvent("task-dropped", { detail: { taskId: id, x: e.clientX, y: e.clientY } }));
        }
      }
    } else if (!hasMoved) {
      // It was a click, trigger onClick
      onClick();
    }

    // Always clean up states
    cleanupDragState(e);
  };

  const cleanupDragState = (e: React.PointerEvent) => {
    setIsPointerDown(false);
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    setHasMoved(false);
    
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (error) {
      // Ignore errors if pointer capture was already released
    }
  };

  const isDone = status === "done";
  const dragSize = 80;

  return (
    <>
      {/* Original card - hidden during drag */}
      <motion.div
        layout={!isDragging}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: isDragging ? 0 : 1 }}
        exit={{ scale: 0, opacity: 0, transition: { duration: 0 } }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="group relative cursor-move rounded-xl shadow-lg transition-all hover:shadow-xl"
        style={{
          width: `${Math.min(scaledSize, 200)}px`,
          height: `${Math.min(scaledSize, 200)}px`,
          background: `var(--task-gradient-${gradientIndex})`,
          padding: `${padding}px`,
          opacity: isDone ? 0.6 : 1,
          borderRadius: "0.75rem",
          visibility: isDragging ? 'hidden' : 'visible',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={(e) => {
          // Clean up if pointer leaves while dragging
          if (isDragging) {
            cleanupDragState(e);
          }
        }}
      >
        <div className="flex h-full flex-col justify-between text-gray-700">
          <div className="flex items-start justify-between gap-2">
            <h3 
              className="line-clamp-3 font-semibold flex-1"
              style={{ 
                fontSize: `${titleFontSize}px`,
                textDecoration: isDone ? "line-through" : "none"
              }}
            >
              {title}
            </h3>
            {isDone && (
              <div className="flex-shrink-0 bg-green-500 rounded-full p-1">
                <Check style={{ width: `${iconSize}px`, height: `${iconSize}px` }} className="text-white" />
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 opacity-80" style={{ fontSize: `${detailFontSize}px` }}>
              <Calendar style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
              <span>{format(new Date(deadline), "MMM d")}</span>
            </div>
            
            <div className="flex items-center gap-1 opacity-80" style={{ fontSize: `${detailFontSize}px` }}>
              <Star style={{ width: `${iconSize}px`, height: `${iconSize}px` }} className="fill-current" />
              <span>{importance}/10</span>
            </div>
          </div>
        </div>
        
        {!isDragging && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute -right-2 -top-2 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ 
              width: `${Math.max(24, scaledSize / 8)}px`, 
              height: `${Math.max(24, scaledSize / 8)}px` 
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <Trash2 style={{ width: `${Math.max(12, scaledSize / 16)}px`, height: `${Math.max(12, scaledSize / 16)}px` }} />
          </Button>
        )}
      </motion.div>

      {/* Dragging circle - only visible during drag */}
      {isDragging && (
        <div
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${dragSize}px`,
            height: `${dragSize}px`,
            background: `var(--task-gradient-${gradientIndex})`,
            borderRadius: "50%",
            zIndex: 1000,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Check className="text-white" size={32} strokeWidth={3} />
        </div>
      )}
    </>
  );
};
