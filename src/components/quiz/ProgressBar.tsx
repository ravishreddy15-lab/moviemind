import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div className="w-full flex justify-between items-center relative px-2">
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -translate-y-1/2 mx-4" />
      <motion.div
        className="absolute top-1/2 left-0 h-0.5 bg-purple-600 -translate-y-1/2 mx-4"
        initial={{ width: "0%" }}
        animate={{
          width: `${(currentStep / (totalSteps - 1)) * 100}%`,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ maxWidth: "calc(100% - 2rem)" }}
      />
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <motion.div
            key={i}
            className={cn(
              "relative z-10 rounded-full transition-all duration-300",
              isCompleted && "bg-purple-600",
              isCurrent && "bg-purple-600 ring-2 ring-purple-500 ring-offset-2 ring-offset-zinc-900",
              !isCompleted && !isCurrent && "bg-zinc-700"
            )}
            initial={{ scale: 0.8 }}
            animate={{
              scale: isCurrent ? 1.25 : 1,
              width: isCurrent ? 16 : 10,
              height: isCurrent ? 16 : 10,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            layout
          />
        );
      })}
    </div>
  );
}
