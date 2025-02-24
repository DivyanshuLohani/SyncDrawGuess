import {
  forwardRef,
  SelectHTMLAttributes,
  ReactNode,
  OptionHTMLAttributes,
} from "react";
import { cn } from "../../lib/utils";

export interface OptionProps extends OptionHTMLAttributes<HTMLOptionElement> {
  children: ReactNode;
}

/**
 * Option Component
 *
 * A simple wrapper around the native option element to maintain consistent styling
 * and prop patterns with the rest of the component library.
 */
export const SelectOption = ({ children, ...rest }: OptionProps) => {
  return <option {...rest}>{children}</option>;
};

SelectOption.displayName = "SelectOption";

// Define the select variants and sizes
const VARIANTS = {
  primary: "border-neutral-300 focus:border-primary-500 focus:ring-primary-500",
  secondary:
    "border-neutral-300 focus:border-secondary-500 focus:ring-secondary-500",
  outline:
    "border-primary-600 text-primary-600 focus:border-primary-500 focus:ring-primary-500",
  error: "border-error-main focus:border-error-main focus:ring-error-main",
  success:
    "border-success-main focus:border-success-main focus:ring-success-main",
} as const;

const SIZES = {
  sm: "py-1.5 pl-3 pr-8 text-sm rounded-md",
  md: "py-2 pl-4 pr-10 text-base rounded-md",
  lg: "py-2.5 pl-5 pr-12 text-lg rounded-lg",
} as const;

const DISABLED = "opacity-50 cursor-not-allowed bg-neutral-100";

// Create type for variant and size based on the keys of their respective objects
type SelectVariant = keyof typeof VARIANTS;
type SelectSize = keyof typeof SIZES;

// Extend the native select props with our custom props
export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  children: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  variant?: SelectVariant;
  size?: SelectSize;
  fullWidth?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * Select Component with forward ref support
 *
 * A styled select component that can have a label, error message, and help text.
 * Supports icons at the start and end, and various sizes and variants.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      children,
      startIcon,
      endIcon,
      variant = "primary",
      size = "md",
      fullWidth = false,
      disabled = false,
      label,
      error,
      helperText,
      className = "",
      containerClassName = "",
      ...rest
    },
    ref
  ) => {
    // Custom chevron icon for the select
    const renderChevron = () => (
      <svg
        className={`absolute right-2 ${
          size === "lg" ? "top-3.5" : size === "sm" ? "top-2" : "top-3"
        } w-5 h-5 text-neutral-500 pointer-events-none`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    );

    const hasError = !!error;
    const variantClass = hasError ? VARIANTS.error : VARIANTS[variant];

    return (
      <div className={`${fullWidth ? "w-full" : ""} ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {startIcon}
            </div>
          )}
          <select
            ref={ref}
            className={cn(
              `
              ${variantClass}
              ${SIZES[size]}
              ${disabled ? DISABLED : ""}
              ${startIcon ? "pl-10" : ""}
              ${endIcon ? "pr-12" : ""}
              ${fullWidth ? "w-full" : ""}
              appearance-none bg-white border shadow-sm
              focus:outline-none focus:ring-2
              transition-colors duration-200
              
            `,
              className
            )}
            disabled={disabled}
            {...rest}
          >
            {children}
          </select>
          {renderChevron()}
          {endIcon && (
            <div className="absolute inset-y-0 right-8 flex items-center pr-2 pointer-events-none">
              {endIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={`mt-1 text-sm ${
              hasError ? "text-error-main" : "text-text-secondary"
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

// Add display name for better debugging
Select.displayName = "Select";
