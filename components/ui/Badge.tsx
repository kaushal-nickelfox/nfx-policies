interface BadgeProps {
  variant?: 'pending' | 'acknowledged' | 'default' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  pending: 'bg-yellow-100 text-yellow-800',
  acknowledged: 'bg-green-100 text-green-800',
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-orange-100 text-orange-800',
  error: 'bg-red-100 text-red-800',
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
