import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-indigo-50 text-indigo-700',
        success: 'bg-green-100 text-green-700',
        destructive: 'bg-red-100 text-red-700',
        secondary: 'bg-gray-100 text-gray-600',
        outline: 'border border-gray-200 text-gray-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const Badge = React.forwardRef(({ className, variant, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
));
Badge.displayName = 'Badge';

export { badgeVariants };
