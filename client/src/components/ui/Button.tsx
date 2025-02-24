import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

// Define the button variants and sizes as constant objects
const VARIANTS = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
  secondary:
    "bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500",
  outline:
    "border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
  ghost: "text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
  danger: "bg-error-main text-white hover:bg-error-dark focus:ring-error-main",
  success:
    "bg-success-main text-white hover:bg-success-dark focus:ring-success-main",
  warning:
    "bg-warning-main text-white hover:bg-warning-dark focus:ring-warning-main",
  info: "bg-info-main text-white hover:bg-info-dark focus:ring-info-main",
} as const;

const SIZES = {
  xs: "px-2 py-1 text-xs rounded-sm",
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-4 py-2 text-base rounded-md",
  lg: "px-5 py-2.5 text-lg rounded-lg",
  xl: "px-6 py-3 text-xl rounded-xl",
} as const;

const DISABLED = "opacity-50 cursor-not-allowed";

type ButtonVariant = keyof typeof VARIANTS;
type ButtonSize = keyof typeof SIZES;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      startIcon,
      endIcon,
      variant = "primary",
      size = "md",
      fullWidth = false,
      disabled = false,
      className = "",
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          `
          ${VARIANTS[variant]}
          ${SIZES[size]}
          ${fullWidth ? "w-full" : ""}
          ${disabled ? DISABLED : ""}
          inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        `,
          className
        )}
        disabled={disabled}
        {...rest}
      >
        {startIcon && (
          <span className={children ? "ml-2" : ""}>{startIcon}</span>
        )}
        {children}
        {endIcon && <span className={children ? "ml-2" : ""}>{endIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
