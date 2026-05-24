import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertOctagon className="w-5 h-5 text-rose-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />,
  };

  const bgStyles = {
    success: 'bg-neutral-900 border-emerald-500/30 text-neutral-100 shadow-emerald-950/20',
    error: 'bg-neutral-900 border-rose-500/30 text-neutral-100 shadow-rose-950/20',
    warning: 'bg-neutral-900 border-amber-500/30 text-neutral-100 shadow-amber-950/20',
    info: 'bg-neutral-900 border-sky-500/30 text-neutral-100 shadow-sky-950/20',
  };

  const borderAccent = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in max-w-sm ${bgStyles[type]}`}
      role="alert"
    >
      {/* Left colored accent bar */}
      <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r ${borderAccent[type]}`} />
      
      <div className="flex-shrink-0 ml-1">{icons[type]}</div>
      
      <div className="flex-1 text-sm font-medium pr-2">{message}</div>
      
      <button
        onClick={onClose}
        className="flex-shrink-0 text-neutral-400 hover:text-neutral-200 transition-colors p-1 rounded-lg hover:bg-neutral-800"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress timer bar */}
      {duration && (
        <div
          className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl ${borderAccent[type]} opacity-40 animate-toast-progress`}
          style={{ animationDuration: `${duration}ms` }}
        />
      )}
    </div>
  );
};
