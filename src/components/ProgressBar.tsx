
import { cn } from "../lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, className }) => {
  // Ensure value is between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  return (
    <div className={cn("w-full bg-secondary rounded-full overflow-hidden", className)}>
      <div 
        className="bg-primary h-full rounded-full transition-all duration-500 ease-in-out"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};
