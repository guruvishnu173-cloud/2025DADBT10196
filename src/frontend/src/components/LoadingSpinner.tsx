import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-7 h-7 border-2",
  lg: "w-10 h-10 border-[3px]",
};

export default function LoadingSpinner({
  size = "md",
  className,
  label,
}: LoadingSpinnerProps) {
  return (
    <div
      aria-label={label ?? "Loading"}
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
      data-ocid="loading_state"
    >
      <div
        className={cn(
          "rounded-full border-primary/20 border-t-primary animate-spin",
          sizeMap[size],
        )}
      />
      {label && (
        <p className="text-sm text-muted-foreground font-body animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}

export function PageLoader({ label = "Loading papers…" }: { label?: string }) {
  return (
    <div
      className="flex-1 flex items-center justify-center min-h-[40vh]"
      data-ocid="loading_state"
    >
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}
