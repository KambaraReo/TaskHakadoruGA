"use client";

import React, { useState, useEffect } from "react";
import { Task } from "@/types/task";
import {
  Save,
  X,
  Target,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskFormValidation } from "@/hooks/useTaskFormValidation";
import { FormField } from "@/components/form/FormField";
import { FormRow } from "@/components/form/FormRow";

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (taskData: TaskFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface TaskFormData {
  title: string;
  description?: string;
  importance: number;
  urgency: number;
  duration: number;
  energy_required: number;
  ease: number;
  deadline?: string;
  dependencies: number[];
  status: "todo" | "in_progress" | "completed" | "cancelled";
}

export const TaskForm = ({
  task,
  onSubmit,
  onCancel,
  isLoading = false,
}: TaskFormProps) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    importance: 3,
    urgency: 3,
    duration: 60,
    energy_required: 5,
    ease: 3,
    deadline: "",
    dependencies: [],
    status: "todo",
  });

  const { errors, validateForm, clearError } = useTaskFormValidation();

  // 編集モードの場合、既存データを設定
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        importance: task.importance,
        urgency: task.urgency,
        duration: task.duration,
        energy_required: task.energy_required,
        ease: task.ease,
        deadline: task.deadline
          ? new Date(task.deadline).toISOString().slice(0, 16)
          : "",
        dependencies: task.dependencies,
        status: task.status,
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData)) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("フォーム送信エラー:", error);
    }
  };

  const handleInputChange = (
    field: keyof TaskFormData,
    value: string | number | number[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // エラーをクリア
    clearError(field);
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      {/* タイトル */}
      <FormField
        label="タスクタイトル"
        htmlFor="title"
        required
        error={errors.title}
      >
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className={cn("form-input", errors.title && "form-input-error")}
          placeholder="タスクのタイトルを入力"
          disabled={isLoading}
        />
      </FormField>

      {/* 説明 */}
      <FormField label="説明" htmlFor="description">
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="form-textarea"
          placeholder="タスクの説明を入力"
          rows={3}
          disabled={isLoading}
        />
      </FormField>

      {/* 重要度・緊急度 */}
      <FormRow>
        <FormField
          label="重要度"
          htmlFor="importance"
          required
          error={errors.importance}
          icon={<Target className="w-4 h-4" />}
        >
          <select
            id="importance"
            value={formData.importance}
            onChange={(e) =>
              handleInputChange("importance", parseInt(e.target.value))
            }
            className={cn(
              "form-select",
              errors.importance && "form-input-error"
            )}
            disabled={isLoading}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="緊急度"
          htmlFor="urgency"
          required
          error={errors.urgency}
          icon={<AlertTriangle className="w-4 h-4" />}
        >
          <select
            id="urgency"
            value={formData.urgency}
            onChange={(e) =>
              handleInputChange("urgency", parseInt(e.target.value))
            }
            className={cn("form-select", errors.urgency && "form-input-error")}
            disabled={isLoading}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </FormField>
      </FormRow>

      {/* 所要時間・エネルギー */}
      <FormRow>
        <FormField
          label="所要時間（分）"
          htmlFor="duration"
          required
          error={errors.duration}
          icon={<Clock className="w-4 h-4" />}
        >
          <input
            id="duration"
            type="number"
            min="1"
            value={formData.duration}
            onChange={(e) =>
              handleInputChange("duration", parseInt(e.target.value) || 0)
            }
            className={cn("form-input", errors.duration && "form-input-error")}
            disabled={isLoading}
          />
        </FormField>

        <FormField
          label="エネルギー"
          htmlFor="energy_required"
          required
          error={errors.energy_required}
          icon={<Zap className="w-4 h-4" />}
        >
          <select
            id="energy_required"
            value={formData.energy_required}
            onChange={(e) =>
              handleInputChange("energy_required", parseInt(e.target.value))
            }
            className={cn(
              "form-select",
              errors.energy_required && "form-input-error"
            )}
            disabled={isLoading}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </FormField>
      </FormRow>

      {/* 難易度・ステータス */}
      <FormRow>
        <FormField
          label="難易度"
          htmlFor="ease"
          required
          error={errors.ease}
          icon={<Shield className="w-4 h-4" />}
        >
          <select
            id="ease"
            value={formData.ease}
            onChange={(e) =>
              handleInputChange("ease", parseInt(e.target.value))
            }
            className={cn("form-select", errors.ease && "form-input-error")}
            disabled={isLoading}
          >
            <option value={1}>1 (とても難しい)</option>
            <option value={2}>2 (難しい)</option>
            <option value={3}>3 (普通)</option>
            <option value={4}>4 (簡単)</option>
            <option value={5}>5 (とても簡単)</option>
          </select>
        </FormField>

        <FormField label="ステータス" htmlFor="status">
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              handleInputChange(
                "status",
                e.target.value as
                  | "todo"
                  | "in_progress"
                  | "completed"
                  | "cancelled"
              )
            }
            className="form-select"
            disabled={isLoading}
          >
            <option value="todo">未着手</option>
            <option value="in_progress">進行中</option>
            <option value="completed">完了</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </FormField>
      </FormRow>

      {/* 期限 */}
      <FormField
        label="期限"
        htmlFor="deadline"
        icon={<Calendar className="w-4 h-4" />}
      >
        <input
          id="deadline"
          type="datetime-local"
          value={formData.deadline}
          onChange={(e) => handleInputChange("deadline", e.target.value)}
          className="form-input datetime-input"
          disabled={isLoading}
        />
      </FormField>

      {/* フォームボタン */}
      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="form-button form-button-secondary"
          disabled={isLoading}
        >
          <X className="w-4 h-4" />
          キャンセル
        </button>
        <button
          type="submit"
          className="form-button form-button-primary"
          disabled={isLoading}
        >
          <Save className="w-4 h-4" />
          {isLoading ? "保存中..." : task ? "更新" : "作成"}
        </button>
      </div>
    </form>
  );
};
