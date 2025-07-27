import React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const FormField = ({
  label,
  htmlFor,
  required = false,
  error,
  icon,
  children,
}: FormFieldProps) => {
  return (
    <div className="form-group">
      <label
        htmlFor={htmlFor}
        className={cn("form-label", required && "required")}
      >
        {icon}
        {label}
      </label>
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
};
