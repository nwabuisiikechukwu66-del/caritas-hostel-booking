import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  fullWidth?: boolean;
}

const variants = {
  primary: "bg-primary text-white hover:bg-primary-dark disabled:bg-ink-faint",
  secondary: "bg-white text-ink border border-border-strong hover:bg-surface-subtle",
  ghost: "bg-transparent text-ink hover:bg-surface-subtle",
  danger: "bg-danger text-white hover:bg-danger/90",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", fullWidth, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-medium
          transition-colors disabled:cursor-not-allowed disabled:opacity-60
          ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
