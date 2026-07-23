import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  stepNumber: number;
  totalSteps: number;
}

export default function QuizCard({ title, description, children, stepNumber, totalSteps }: QuizCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8",
        "w-full"
      )}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white text-sm font-bold">
            {stepNumber}
          </span>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        {description && (
          <p className="text-zinc-400 mt-1 ml-11">{description}</p>
        )}
      </div>
      <div>{children}</div>
      <div className="mt-6 flex justify-end">
        <span className="text-xs text-zinc-600">
          Step {stepNumber} of {totalSteps}
        </span>
      </div>
    </motion.div>
  );
}
