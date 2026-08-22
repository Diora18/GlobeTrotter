import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-slate-900 text-white',
        secondary: 'border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200',
        destructive: 'border-transparent bg-red-100 text-red-700',
        outline: 'border-slate-200 text-slate-700',
        sky: 'border-transparent bg-sky-100 text-sky-700',
        emerald: 'border-transparent bg-emerald-100 text-emerald-700',
        amber: 'border-transparent bg-amber-100 text-amber-800',
        purple: 'border-transparent bg-purple-100 text-purple-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
