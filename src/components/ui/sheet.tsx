'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
}

/**
 * Sheet component - Mobile drawer/sidebar
 * Slides in from the side with backdrop overlay
 */
export function Sheet({ open, onOpenChange, children, side = 'left' }: SheetProps) {
  // Close on ESC key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onOpenChange]);

  // Lock body scroll when sheet is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed z-50 bg-slate-900/95 backdrop-blur-md border-slate-800',
          'shadow-2xl overflow-y-auto',
          side === 'left' 
            ? 'left-0 top-0 bottom-0 animate-slide-in-from-left border-r' 
            : 'right-0 top-0 bottom-0 animate-slide-in-from-right border-l',
          'w-[320px] max-w-[85vw]'
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-slate-400 hover:text-white" />
        </button>

        {/* Content */}
        <div className="h-full">
          {children}
        </div>
      </div>
    </>
  );
}
