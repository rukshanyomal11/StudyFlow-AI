// Button component with different variants and sizes
import React from 'react';

const buttonVariants = {
  default: 'bg-gray-900 text-gray-50 hover:bg-gray-900/90 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90',
  destructive: 'bg-red-500 text-gray-50 hover:bg-red-600 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/90',
  outline: 'border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80',
  ghost: 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50',
  link: 'text-gray-900 underline-offset-4 hover:underline dark:text-gray-50',
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-600',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
};

const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3 text-sm',
  lg: 'h-11 rounded-md px-8 text-base',
  icon: 'h-10 w-10',
};

const Button = React.forwardRef(({
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  asChild = false,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300';

  const variantClasses = buttonVariants[variant] || buttonVariants.default;
  const sizeClasses = buttonSizes[size] || buttonSizes.default;

  const classes = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`;

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
export default Button;