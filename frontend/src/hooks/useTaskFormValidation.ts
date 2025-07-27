import { useState } from "react";
import { TaskFormData } from "@/components/TaskForm";

interface ValidationErrors {
  [key: string]: string;
}

export const useTaskFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (formData: TaskFormData): boolean => {
    const newErrors: ValidationErrors = {};

    // タイトル必須チェック
    if (!formData.title.trim()) {
      newErrors.title = "タイトルは必須です";
    }

    // 整数値チェック
    if (
      !Number.isInteger(formData.importance) ||
      formData.importance < 1 ||
      formData.importance > 5
    ) {
      newErrors.importance = "重要度は1-5の整数で入力してください";
    }

    if (
      !Number.isInteger(formData.urgency) ||
      formData.urgency < 1 ||
      formData.urgency > 5
    ) {
      newErrors.urgency = "緊急度は1-5の整数で入力してください";
    }

    if (!Number.isInteger(formData.duration) || formData.duration < 1) {
      newErrors.duration = "所要時間は1以上の整数で入力してください";
    }

    if (
      !Number.isInteger(formData.energy_required) ||
      formData.energy_required < 1 ||
      formData.energy_required > 10
    ) {
      newErrors.energy_required = "エネルギーは1-10の整数で入力してください";
    }

    if (
      !Number.isInteger(formData.ease) ||
      formData.ease < 1 ||
      formData.ease > 5
    ) {
      newErrors.ease = "難易度は1-5の整数で入力してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateForm,
    clearError,
    clearAllErrors,
  };
};
