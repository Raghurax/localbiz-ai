import React, { createContext, useContext, useState, useEffect, ReactNode, forwardRef } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

/* ============================================================
   1. BUTTON
   ============================================================ */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";
  
  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 h-8",
    md: "text-sm px-4 py-2 h-9",
    lg: "text-sm px-5 py-2.5 h-11",
  }[size];

  const variantStyles = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-600 shadow-sm",
    secondary: "bg-transparent text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/40 focus-visible:ring-primary-600",
    ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 focus-visible:ring-slate-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm",
  }[variant];

  return (
    <button
      ref={ref}
      className={`${base} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : icon}
      {children}
    </button>
  );
});
Button.displayName = 'Button';

/* ============================================================
   2. BADGE
   ============================================================ */
export interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
  children: ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '' }) => {
  const styles = {
    success: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-800/40",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40",
    error: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/40",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40",
    neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    primary: "bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 border border-primary-200 dark:border-primary-800/40",
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium ${styles} ${className}`}>
      {children}
    </span>
  );
};

/* ============================================================
   3. CARD
   ============================================================ */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  elevated?: boolean;
  children: ReactNode;
}

export const Card: React.FC<CardProps> = ({ hover = false, elevated = false, children, className = '', ...props }) => {
  return (
    <div
      className={`rounded-xl border transition-all duration-150 ${
        elevated
          ? 'bg-[--color-surface-elevated] shadow-md border-[--color-border]'
          : 'bg-[--color-surface] shadow-sm border-[--color-border]'
      } ${hover ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/* ============================================================
   4. INPUT
   ============================================================ */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 ${
            icon ? 'pl-9' : ''
          } ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';

/* ============================================================
   5. TEXTAREA
   ============================================================ */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={areaId} className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={areaId}
        className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-150 ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
});
Textarea.displayName = 'Textarea';

/* ============================================================
   6. SKELETON
   ============================================================ */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`skeleton bg-slate-200 dark:bg-slate-800 ${className}`} />
  );
};

/* ============================================================
   7. SPINNER
   ============================================================ */
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }[size];

  return <Loader2 className={`animate-spin text-primary-600 dark:text-primary-400 ${sizes} ${className}`} />;
};

/* ============================================================
   8. EMPTY STATE
   ============================================================ */
export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`card border-dashed p-10 text-center flex flex-col items-center justify-center ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

/* ============================================================
   9. PAGE HEADER
   ============================================================ */
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backAction?: () => void;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  backAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-6 ${className}`}>
      <div>
        <div className="flex items-center gap-2">
          {backAction && (
            <button
              onClick={backAction}
              className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Go back"
            >
              <X className="w-5 h-5 rotate-45" />
            </button>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        </div>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};

/* ============================================================
   10. MODAL
   ============================================================ */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-md'
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true"
      role="dialog"
    >
      <div className={`relative w-full ${maxWidth} bg-[--color-surface] rounded-2xl shadow-xl border border-[--color-border] p-6 animate-slide-up`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="py-2 text-sm text-slate-700 dark:text-slate-300">{children}</div>
        {footer && <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

/* ============================================================
   11. TOAST SYSTEM
   ============================================================ */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, border: 'border-l-green-500', text: 'text-green-600 dark:text-green-400' },
    error: { icon: AlertCircle, border: 'border-l-red-500', text: 'text-red-600 dark:text-red-400' },
    warning: { icon: AlertTriangle, border: 'border-l-amber-500', text: 'text-amber-600 dark:text-amber-400' },
    info: { icon: Info, border: 'border-l-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg border-l-4 ${config.border} animate-slide-up`}>
      <div className="flex items-center gap-2.5">
        <Icon className={`w-4 h-4 shrink-0 ${config.text}`} />
        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const useToast = () => useContext(ToastContext);

/* ============================================================
   12. STATUS DOT
   ============================================================ */
export const StatusDot: React.FC<{ status: 'online' | 'idle' | 'error'; className?: string }> = ({
  status,
  className = ''
}) => {
  const colors = {
    online: 'bg-green-500',
    idle: 'bg-amber-500',
    error: 'bg-red-500',
  }[status];

  return <span className={`inline-block w-2 h-2 rounded-full ${colors} ${className}`} />;
};
