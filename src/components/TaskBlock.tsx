import { motion } from "framer-motion";
import { Trash2, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface TaskBlockProps {
  id: string;
  title: string;
  deadline: string;
  importance: number;
  size: number;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export const TaskBlock = ({
  id,
  title,
  deadline,
  importance,
  size,
  onClick,
  onDelete,
}: TaskBlockProps) => {
  const baseSize = 80;
  const scaledSize = baseSize + (size * 40); // Более выраженная разница в размерах
  
  // Dynamic font sizes based on card size
  const titleFontSize = Math.max(10, Math.min(scaledSize / 8, 16));
  const detailFontSize = Math.max(8, Math.min(scaledSize / 12, 12));
  const iconSize = Math.max(10, Math.min(scaledSize / 15, 14));
  const padding = Math.max(8, Math.min(scaledSize / 10, 16));
  
  const gradientIndex = importance > 5 ? 1 : 2;

  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group relative cursor-pointer rounded-xl shadow-lg transition-all hover:shadow-xl"
      onClick={onClick}
      style={{
        width: `${scaledSize}px`,
        height: `${scaledSize}px`,
        background: `var(--task-gradient-${gradientIndex})`,
        padding: `${padding}px`,
      }}
    >
      <div className="flex h-full flex-col justify-between text-gray-700">
        <div>
          <h3 
            className="line-clamp-3 font-semibold"
            style={{ fontSize: `${titleFontSize}px` }}
          >
            {title}
          </h3>
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
