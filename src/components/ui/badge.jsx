// Badge component for labels and status indicators
import React from 'react';

const badgeVariants = {
  default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80 bg-gray-900 text-white',
  secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-gray-100 text-gray-900',
  destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 bg-red-500 text-white',
  outline: 'text-foreground border-gray-300 text-gray-700',
  success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
  warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
};

const Badge = React.forwardRef(({
  className = '',
  variant = 'default',
  children,
  ...props
}, ref) => {
  const variantClasses = badgeVariants[variant] || badgeVariants.default;

  return (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
export default Badge;
