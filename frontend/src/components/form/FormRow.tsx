import React from "react";

interface FormRowProps {
  children: React.ReactNode;
}

export const FormRow = ({ children }: FormRowProps) => {
  return <div className="form-row">{children}</div>;
};
