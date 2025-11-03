import { motion } from "framer-motion";
import { Trash2, Calendar, Star, Check, Loader2, AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState, useRef } from "react";
import { SyncState } from "@/lib/db";

interface TaskBlockProps {
  id: string;
  title: string;
  deadline: string;
  importance: number;
  size: number;
  status?: string;
  syncState?: SyncState;
  syncError?: string;
  onClick: () => void;
  onDelete: (id: string) => void;
  onRetry?: () => void;
}

export const TaskBlock = ({
  id,
  title,
  deadline,
  importance,
  size,
  status = "in_progress",
  syncState = "synced",
  syncError,
  onClick,
  onDelete,
  onRetry,
}: TaskBlockProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const originRef = useRef({ x: 0, y: 0 });
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

  const handleDragStart = (e: React.DragEvent | React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    originRef.current = { x: rect.left, y: rect.top };
    setIsDragging(true);

    if ('dataTransfer' in e) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
    }
  };

  const handleDrag = (e: React.DragEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }

    if (clientX === 0 && clientY === 0) return;
    
    setPosition({
      x: clientX - originRef.current.x - scaledSize / 2,
      y: clientY - originRef.current.y - scaledSize / 2,
    });
  };

  const handleDragEnd = (e: React.DragEvent | React.TouchEvent) => {
    if (!isDragging) return;

    let clientX: number, clientY: number;
    if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      setIsDragging(false);
      setPosition({ x: 0, y: 0 });
      return;
    }

    const characterEl = document.getElementById("character-drop-zone");
    if (characterEl) {
      const rect = characterEl.getBoundingClientRect();
      const isOverCharacter =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

      if (isOverCharacter) {
        window.dispatchEvent(new CustomEvent("task-dropped", { detail: { taskId: id, x: clientX, y: clientY } }));
      }
    }

    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
  };

  const isDone = status === "done";

  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group relative cursor-move rounded-xl shadow-lg transition-all hover:shadow-xl"
      onClick={onClick}
      style={{
        width: isDragging ? `${Math.min(scaledSize, 200)}px` : `${Math.min(scaledSize, 200)}px`,
        height: isDragging ? `${Math.min(scaledSize, 200)}px` : `${Math.min(scaledSize, 200)}px`,
        background: `var(--task-gradient-${gradientIndex})`,
        padding: `${padding}px`,
        transform: isDragging ? `translate(${position.x}px, ${position.y}px)` : undefined,
        transition: isDragging ? "none" : "transform 0.3s ease-out",
        opacity: isDone ? 0.6 : 1,
        borderRadius: isDragging ? "0.5rem" : "0.75rem",
      }}
      draggable
      onDragStart={handleDragStart as any}
      onDrag={handleDrag as any}
      onDragEnd={handleDragEnd as any}
      onTouchStart={handleDragStart as any}
      onTouchMove={handleDrag as any}
      onTouchEnd={handleDragEnd as any}
    >
      {isDragging ? (
        <div className="flex h-full items-center justify-center">
          <span className="text-gray-700 font-bold text-lg">done?</span>
        </div>
      ) : (
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
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {isDone && (
                <div className="bg-green-500 rounded-full p-1">
                  <Check style={{ width: `${iconSize}px`, height: `${iconSize}px` }} className="text-white" />
                </div>
              )}
              {syncState === 'pending' && (
                <Loader2 
                  style={{ width: `${iconSize}px`, height: `${iconSize}px` }} 
                  className="animate-spin text-blue-500" 
                />
              )}
              {syncState === 'failed' && (
                <div className="relative group/sync">
                  <AlertCircle 
                    style={{ width: `${iconSize}px`, height: `${iconSize}px` }} 
                    className="text-red-500" 
                  />
                  {onRetry && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-0 right-0 opacity-0 group-hover/sync:opacity-100 transition-opacity"
                      style={{ 
                        width: `${Math.max(20, iconSize * 1.5)}px`, 
                        height: `${Math.max(20, iconSize * 1.5)}px` 
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetry();
                      }}
                    >
                      <RotateCw style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
                    </Button>
                  )}
                </div>
              )}
            </div>
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
      )}
      
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
    </motion.div>
  );
};
