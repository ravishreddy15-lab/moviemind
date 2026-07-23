import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "text" | "avatar" | "rectangular";
  className?: string;
}

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg shimmer-bg",
        className
      )}
    />
  );
}

export default function LoadingSkeleton({
  variant = "card",
  className,
}: LoadingSkeletonProps) {
  if (variant === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        <SkeletonPulse className="h-4 w-3/4" />
        <SkeletonPulse className="h-4 w-1/2" />
        <SkeletonPulse className="h-4 w-5/6" />
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <SkeletonPulse className={cn("h-10 w-10 rounded-full", className)} />
    );
  }

  if (variant === "rectangular") {
    return (
      <SkeletonPulse
        className={cn("h-48 w-full rounded-xl", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-card border border-border overflow-hidden",
        className
      )}
    >
      <SkeletonPulse className="h-56 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonPulse className="h-5 w-3/4" />
        <SkeletonPulse className="h-3 w-1/2" />
        <div className="flex gap-2">
          <SkeletonPulse className="h-5 w-12 rounded-full" />
          <SkeletonPulse className="h-5 w-14 rounded-full" />
          <SkeletonPulse className="h-5 w-10 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonPulse className="h-4 w-4 rounded-full" />
          <SkeletonPulse className="h-3 w-8" />
        </div>
      </div>
    </div>
  );
}
