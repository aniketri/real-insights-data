'use client';

import { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Design System Colors
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
};

// Animation variants
export const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 }
  },
  bounce: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  }
};

// Button variants
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl",
        destructive: "bg-error-600 text-white hover:bg-error-700 shadow-lg hover:shadow-xl",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "text-gray-700 hover:bg-gray-100",
        link: "text-primary-600 underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

// Button component with animations
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {loading && (
          <motion.div
            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

// Input variants
const inputVariants = cva(
  "flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:border-primary-500",
        error: "border-error-300 focus:border-error-500 focus:ring-error-500",
        success: "border-success-300 focus:border-success-500 focus:ring-success-500"
      },
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-8 px-2 py-1 text-xs",
        lg: "h-12 px-4 py-3 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

// Input component
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, success, icon, ...props }, ref) => {
    const inputVariant = error ? 'error' : success ? 'success' : variant;
    
    return (
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            className={cn(
              inputVariants({ variant: inputVariant, size, className }),
              icon && "pl-10"
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <motion.p 
            className="text-sm text-error-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p 
            className="text-sm text-success-600"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {success}
          </motion.p>
        )}
      </motion.div>
    );
  }
);
Input.displayName = "Input";

// Card component
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl border border-gray-200 bg-white p-6 shadow-sm",
          hover && "hover:shadow-lg transition-shadow duration-200",
          className
        )}
        whileHover={hover ? { y: -2 } : undefined}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
Card.displayName = "Card";

// Badge component
const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-100 text-primary-800",
        secondary: "bg-gray-100 text-gray-800",
        success: "bg-success-100 text-success-800",
        error: "bg-error-100 text-error-800",
        warning: "bg-warning-100 text-warning-800"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <motion.div
        className={cn(badgeVariants({ variant }), className)}
        ref={ref}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

// Loading Spinner
export const LoadingSpinner = ({ size = "default" }: { size?: "sm" | "default" | "lg" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <motion.div
      className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", sizeClasses[size])}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    />
  );
};

// Alert component
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 text-sm",
  {
    variants: {
      variant: {
        default: "bg-gray-50 border-gray-200 text-gray-800",
        success: "bg-success-50 border-success-200 text-success-800",
        error: "bg-error-50 border-error-200 text-error-800",
        warning: "bg-warning-50 border-warning-200 text-warning-800"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: ReactNode;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, icon, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(alertVariants({ variant }), className)}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      >
        {icon && (
          <div className="mb-2 flex items-center">
            {icon}
          </div>
        )}
        {children}
      </motion.div>
    );
  }
);
Alert.displayName = "Alert";

// Modal component
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Modal = ({ isOpen, onClose, title, children, size = "md" }: ModalProps) => {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={cn("w-full bg-white rounded-xl shadow-xl", sizeClasses[size])}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Page Header component
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const PageHeader = ({ title, subtitle, action, breadcrumbs }: PageHeaderProps) => {
  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {breadcrumbs && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="text-gray-500 hover:text-gray-700 transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </motion.div>
  );
};

// Container component
export const Container = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)} {...props}>
      {children}
    </div>
  );
};

// Section component
export const Section = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <motion.section
      className={cn("py-12", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.section>
  );
}; 