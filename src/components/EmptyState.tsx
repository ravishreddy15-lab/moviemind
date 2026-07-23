import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 rounded-full bg-zinc-800/50 p-6">
        <Icon className="h-12 w-12 text-zinc-500" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
      <p className="mb-6 max-w-md text-zinc-400">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </motion.div>
  );
}
