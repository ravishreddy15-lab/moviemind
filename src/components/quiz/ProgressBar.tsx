import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = `${(currentStep / (totalSteps - 1)) * 100}%`;

  return (
    <div className="w-full flex justify-between items-center relative px-2">
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -translate-y-1/2 mx-4" />
      <div
        className="absolute top-1/2 left-0 h-0.5 bg-purple-600 -translate-y-1/2 mx-4 transition-all duration-500 ease-out"
        style={{ width: progress, maxWidth: "calc(100% - 2rem)" }}
      />
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <div
            key={i}
            className={cn(
              "relative z-10 rounded-full transition-all duration-300 ease-out",
              isCompleted && "bg-purple-600",
              isCurrent && "bg-purple-600 ring-2 ring-purple-500 ring-offset-2 ring-offset-zinc-900",
              !isCompleted && !isCurrent && "bg-zinc-700"
            )}
            style={{
              width: isCurrent ? 16 : 10,
              height: isCurrent ? 16 : 10,
              transform: isCurrent ? "scale(1.25)" : "scale(1)",
            }}
          />
        );
      })}
    </div>
  );
}
