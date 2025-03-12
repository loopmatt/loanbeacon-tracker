
import React from "react";
import { cn } from "../lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  showPercentage?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
  thickness?: "thin" | "default" | "thick";
  animated?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className,
  showPercentage = false,
  variant = "default",
  thickness = "default",
  animated = true,
  label,
}) => {
  // Ensure value is between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  // Determine color based on variant
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-emerald-500";
      case "warning":
        return "bg-amber-500";
      case "danger":
        return "bg-red-500";
      default:
        return "bg-primary";
    }
  };
  
  // Determine height based on thickness
  const getThicknessClasses = () => {
    switch (thickness) {
      case "thin":
        return "h-2";
      case "thick":
        return "h-4";
      default:
        return "h-3";
    }
  };
  
  return (
    <div className="w-full space-y-1">
      {label && (
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          {showPercentage && <span>{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div 
        className={cn(
          "w-full bg-secondary rounded-full overflow-hidden",
          getThicknessClasses(),
          className
        )}
      >
        <div 
          className={cn(
            getVariantClasses(),
            "h-full rounded-full",
            animated ? "transition-all duration-500 ease-in-out" : "",
            clampedValue > 0 && clampedValue < 3 ? "min-w-[3%]" : ""
          )}
          style={{ width: `${clampedValue}%` }}
        >
          {!label && showPercentage && clampedValue >= 20 && (
            <span className="px-2 text-xs text-white flex items-center h-full justify-center">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
