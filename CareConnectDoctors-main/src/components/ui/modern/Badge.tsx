import React from "react";
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
} from "lucide-react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "primary";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantConfig = {
  success: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-300",
    icon: CheckCircle,
  },
  warning: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-800 dark:text-amber-300",
    icon: AlertTriangle,
  },
  danger: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-300",
    icon: AlertCircle,
  },
  info: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-300",
    icon: Info,
  },
  primary: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-800 dark:text-purple-300",
    icon: XCircle,
  },
};

export function Badge({
  variant = "info",
  size = "md",
  icon = false,
  children,
  className = "",
}: BadgeProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const sizeStyles = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  return (
    <div
      className={`inline-flex items-center ${sizeStyles[size]} rounded-full font-medium ${config.bg} ${config.text} ${className}`}
    >
      {icon && (
        <Icon
          size={icon ? (size === "sm" ? 14 : size === "md" ? 16 : 18) : 0}
        />
      )}
      {children}
    </div>
  );
}
