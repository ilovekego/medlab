'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Trash2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve?: (value: boolean) => void;
  }>({
    isOpen: false,
    options: { message: '' },
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setModalState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    if (modalState.resolve) {
      modalState.resolve(result);
    }
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, [modalState]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {modalState.isOpen && (
        <ConfirmDialogView
          options={modalState.options}
          onConfirm={() => handleClose(true)}
          onCancel={() => handleClose(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

interface ConfirmDialogViewProps {
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialogView({ options, onConfirm, onCancel }: ConfirmDialogViewProps) {
  const {
    title = 'Confirm Action',
    message,
    itemName,
    confirmText,
    cancelText = 'Cancel',
    variant = 'danger',
  } = options;

  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button on open & listen for escape key
  useEffect(() => {
    confirmButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Lock scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top accent bar */}
        <div
          className={`h-1.5 w-full ${
            isDanger
              ? 'bg-rose-500'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-sky-500'
          }`}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            {/* Visual Icon Badge */}
            <div
              className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border shadow-2xs ${
                isDanger
                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                  : isWarning
                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                  : 'bg-sky-50 text-sky-600 border-sky-100'
              }`}
            >
              {isDanger ? (
                <Trash2 className="w-5 h-5" />
              ) : isWarning ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
            </div>

            {/* Content Details */}
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                {message}
              </p>

              {/* Optional Item Highlight Badge */}
              {itemName && !message.includes(itemName) && (
                <div className="mt-3 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 truncate inline-block max-w-full">
                  {itemName}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-xs font-bold transition shadow-sm cursor-pointer ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/20'
            }`}
          >
            {isDanger && <Trash2 className="w-4 h-4" />}
            <span>{confirmText || (isDanger ? 'Delete' : 'Confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
