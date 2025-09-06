"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthValidation } from "@/hooks/useAuthValidation";
import { RegisterRequest } from "@/types/auth";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
}) => {
  const { register } = useAuth();
  const { errors, validateRegisterForm, clearErrors } = useAuthValidation();
  const [formData, setFormData] = useState<RegisterRequest>({
    name: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearErrors();

    const formDataWithConfirmation = {
      ...formData,
      passwordConfirmation: confirmPassword,
    };

    if (!validateRegisterForm(formDataWithConfirmation)) {
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "登録に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // リアルタイムでエラーをクリア
    if (errors[name as keyof typeof errors]) {
      clearErrors();
    }
  };

  return (
    <div className="content-board">
      <div className="board-content">
        {error && (
          <div
            className="px-4 py-3 rounded mb-4 border"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              borderColor: "var(--priority-urgent)",
              color: "var(--priority-urgent)",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label required">
              名前
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? "form-input-error" : ""}`}
              placeholder="お名前を入力"
              style={{ textTransform: "none" }}
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label required">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? "form-input-error" : ""}`}
              placeholder="example@email.com"
              style={{ textTransform: "none" }}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label required">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${
                errors.password ? "form-input-error" : ""
              }`}
              placeholder="6文字以上のパスワードを入力"
              style={{ textTransform: "none" }}
            />
            {errors.password && (
              <div className="form-error">{errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label required">
              パスワード確認
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              className={`form-input ${
                errors.passwordConfirmation ? "form-input-error" : ""
              }`}
              placeholder="パスワードを再入力"
              style={{ textTransform: "none" }}
            />
            {errors.passwordConfirmation && (
              <div className="form-error">{errors.passwordConfirmation}</div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading}
              className="form-button w-full text-center"
              style={{
                backgroundColor: "var(--status-completed)",
                borderColor: "var(--status-completed)",
                color: "white",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = "#1e7e34";
                  e.currentTarget.style.borderColor = "#1e7e34";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor =
                    "var(--status-completed)";
                  e.currentTarget.style.borderColor = "var(--status-completed)";
                }
              }}
            >
              {isLoading ? "登録中..." : "登録"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p style={{ color: "#fff", fontSize: "0.9rem" }}>
            既にアカウントをお持ちの方は{" "}
            <button
              onClick={onSwitchToLogin}
              className="font-medium transition-colors duration-200"
              style={{ color: "#fff", textDecoration: "underline" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "white";
              }}
            >
              ログイン
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
