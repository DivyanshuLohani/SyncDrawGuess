import { motion } from "framer-motion";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

const CustomDialog = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
}: DialogProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Hide scrollbar
    } else {
      document.body.style.overflow = ""; // Restore scrollbar
    }

    return () => {
      document.body.style.overflow = ""; // Cleanup on unmount
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
      {/* Dialog Panel */}
      <motion.div
        initial={{ opacity: 0, y: "-100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "-100%" }}
        transition={{ duration: 0.2 }}
        className="bg-background-paper text-text-primary rounded-xl shadow-xl max-w-md w-full p-6 relative border border-neutral-200 dark:border-neutral-700"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          <X className="w-5 h-5 text-text-primary" />
        </button>

        {/* Header */}
        {title && (
          <h2 className="text-lg font-semibold text-primary-700 dark:text-primary-400">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        )}

        {/* Content */}
        <div className="mt-4">{children}</div>

        {/* Footer */}
        {footer && <div className="mt-6">{footer}</div>}
      </motion.div>
    </div>
  );
};

export default CustomDialog;
