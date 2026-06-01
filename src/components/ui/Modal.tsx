import React, { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!isOpen) return null;

  const sizeClass = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <style>{`
        @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sheetUp    { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalPop   { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .modal-backdrop { animation: backdropIn 0.22s ease both; }
        .modal-sheet    { animation: sheetUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .modal-card     { animation: modalPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      {/* Backdrop */}
      <div
        className="modal-backdrop absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'relative w-full modal-sheet sm:modal-card',
          'rounded-t-[28px] sm:rounded-3xl',
          'bg-white dark:bg-gray-900',
          'border-t border-gray-100 dark:border-white/[0.06] sm:border',
          'shadow-2xl dark:shadow-black/50',
          'max-h-[92vh] overflow-hidden flex flex-col',
          sizeClass,
          className
        )}
      >
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-white/20"/>
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06] shrink-0">
            <h2 className="text-base font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all active:scale-90"
            >
              <X size={17}/>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
