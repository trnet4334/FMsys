'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

type OverlayProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Overlay({ title, onClose, children }: OverlayProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside className="relative ml-auto h-full w-full max-w-md bg-card border-l border-line shadow-[−20px_0_50px_rgba(0,0,0,0.3)] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-line shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg text-ink-1 hover:text-ink-0 hover:bg-bg-1 transition-colors"
          >
            <X size={16} />
          </button>
          <span className="text-sm font-bold text-ink-0">{title}</span>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </aside>
    </div>
  );
}
