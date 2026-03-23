// Card component for displaying content in a card layout
import React from 'react';

const Card = React.forwardRef(({
  children,
  className = '',
  hover = false,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 ${hover ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`p-6 pt-0 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
