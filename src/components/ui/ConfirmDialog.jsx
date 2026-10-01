import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, AlertCircle, HelpCircle, X } from 'lucide-react';
import Button from './Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  itemName = null,
  note = null,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'danger' // 'danger' | 'warning' | 'info'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          icon: AlertCircle,
          ring: 'ring-amber-500/10',
          bg: 'bg-amber-500/15',
          text: 'text-amber-500',
          glow: 'from-amber-500/20 to-orange-500/30',
          confirmVariant: 'primary'
        };
      case 'info':
        return {
          icon: HelpCircle,
          ring: 'ring-indigo-500/10',
          bg: 'bg-indigo-500/15',
          text: 'text-indigo-500',
          glow: 'from-indigo-500/20 to-blue-500/30',
          confirmVariant: 'primary'
        };
      case 'danger':
      default:
        return {
          icon: Trash2,
          ring: 'ring-rose-500/10',
          bg: 'bg-rose-500/15',
          text: 'text-rose-500',
          glow: 'from-rose-500/20 to-red-600/30',
          confirmVariant: 'danger'
        };
    }
  };

  const currentVariant = getVariantStyles();
  const IconComponent = currentVariant.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Dialog Box */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 z-10 my-8 transform transition-all duration-200 scale-100 text-center"
        role="alertdialog"
        aria-modal="true"
      >
        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Floating Glowing Icon */}
        <div className="relative mb-5 flex justify-center">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${currentVariant.glow} ring-8 ${currentVariant.ring} flex items-center justify-center ${currentVariant.text} shadow-lg shadow-rose-500/10 transition-transform duration-300 hover:scale-105`}
          >
            <IconComponent className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          {title}
        </h3>

        {/* Main Message */}
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          {message}
        </p>

        {/* Item Preview Card (if applicable) */}
        {itemName && (
          <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {itemName}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 shrink-0">
              Akan Dihapus
            </span>
          </div>
        )}

        {/* Optional Secondary Note */}
        {note && (
          <div className="mb-5 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span className="leading-snug">{note}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            className="w-full justify-center"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={currentVariant.confirmVariant}
            size="md"
            icon={variant === 'danger' ? Trash2 : undefined}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full justify-center shadow-lg shadow-rose-600/25"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
