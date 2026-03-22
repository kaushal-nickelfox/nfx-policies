interface ProgressBarProps {
  value: number; // 0-100
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  size = 'md',
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2.5';

  const colorClass =
    clampedValue >= 80
      ? 'bg-green-500'
      : clampedValue >= 50
        ? 'bg-blue-500'
        : 'bg-yellow-500';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex-1 overflow-hidden rounded-full bg-slate-200 ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-10 text-right text-sm font-medium text-slate-600">
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
