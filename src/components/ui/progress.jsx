// Progress component for displaying progress bars
import React from 'react';

const Progress = React.forwardRef(({
  className = '',
  value = 0,
  max = 100,
  indicatorClassName = '',
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      ref={ref}
      className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${className}`}
      {...props}
    >
      <div
        className={`h-full transition-all duration-300 ease-in-out ${indicatorClassName || 'bg-blue-600'}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
});
Progress.displayName = 'Progress';

export { Progress };
export default Progress;
