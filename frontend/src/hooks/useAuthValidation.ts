import { useState } from "react";
import { LoginRequest, RegisterRequest } from "@/types/auth";

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
}

export const useAuthValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return "メールアドレスは必須です";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "有効なメールアドレスを入力してください";
    }

    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "パスワードは必須です";
    }

    if (password.length < 6) {
      return "パスワードは6文字以上で入力してください";
    }

    return undefined;
  };

  const validateName = (name: string): string | undefined => {
    if (!name) {
      return "名前は必須です";
    }

    if (name.length < 2) {
      return "名前は2文字以上で入力してください";
    }

    if (name.length > 50) {
      return "名前は50文字以下で入力してください";
    }

    return undefined;
  };

  const validatePasswordConfirmation = (
    password: string,
    passwordConfirmation: string
  ): string | undefined => {
    if (!passwordConfirmation) {
      return "パスワード確認は必須です";
    }

    if (password !== passwordConfirmation) {
      return "パスワードが一致しません";
    }

    return undefined;
  };

  const validateLoginForm = (data: LoginRequest): boolean => {
    const newErrors: ValidationErrors = {};

    const emailError = validateEmail(data.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(data.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = (
    data: RegisterRequest & { passwordConfirmation: string }
  ): boolean => {
    const newErrors: ValidationErrors = {};

    const nameError = validateName(data.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(data.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(data.password);
    if (passwordError) newErrors.password = passwordError;

    const passwordConfirmationError = validatePasswordConfirmation(
      data.password,
      data.passwordConfirmation
    );
    if (passwordConfirmationError) {
      newErrors.passwordConfirmation = passwordConfirmationError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
  };

  const setFieldError = (field: keyof ValidationErrors, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearFieldError = (field: keyof ValidationErrors) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return {
    errors,
    validateLoginForm,
    validateRegisterForm,
    clearErrors,
    setFieldError,
    clearFieldError,
  };
};
