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
  onDelete: (id: string) => void;
}

export const TaskBlock = ({
  id,
  title,
  deadline,
  importance,
  size,
  onDelete,
}: TaskBlockProps) => {
  const baseSize = 100;
  const scaledSize = Math.max(baseSize, Math.min(baseSize * size, 400));
  
  const gradientIndex = importance > 5 ? 1 : 2;

  return (
    <motion.div
      layout
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group relative rounded-xl shadow-lg hover:shadow-xl"
      style={{
        width: `${scaledSize}px`,
        height: `${scaledSize}px`,
        background: `var(--task-gradient-${gradientIndex})`,
      }}
    >
      <div className="flex h-full flex-col justify-between p-4 text-white">
        <div>
          <h3 className="line-clamp-3 text-sm font-semibold md:text-base">
            {title}
          </h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-xs opacity-90">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(deadline), "MMM d")}</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs opacity-90">
            <Star className="h-3 w-3 fill-current" />
            <span>{importance}/10</span>
          </div>
        </div>
      </div>
      
      <Button
        size="icon"
        variant="destructive"
        className="absolute -right-2 -top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => onDelete(id)}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </motion.div>
  );
};
