"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthValidation } from "@/hooks/useAuthValidation";
import { LoginRequest } from "@/types/auth";
import toast from "react-hot-toast";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const { errors, validateLoginForm, clearErrors } = useAuthValidation();
  const [formData, setFormData] = useState<LoginRequest>(() => {
    // 初期化時にlocalStorageからメールアドレスを復元
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("login_email");
      return {
        email: savedEmail || "",
        password: "",
      };
    }
    return {
      email: "",
      password: "",
    };
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!validateLoginForm(formData)) {
      return;
    }

    setIsLoading(true);

    try {
      // ログイン試行時にメールアドレスを保存
      if (typeof window !== "undefined") {
        localStorage.setItem("login_email", formData.email);
      }

      await login(formData);
      toast.success("ログインしました");

      // ログイン成功時はメールアドレスの保存をクリア
      if (typeof window !== "undefined") {
        localStorage.removeItem("login_email");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "ログインに失敗しました";
      toast.error(errorMessage);
      // ログイン失敗時はパスワードのみクリア、メールアドレスは保持
      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // リアルタイムでエラーをクリア
    if (errors[name as keyof typeof errors]) {
      clearErrors();
    }
  };

  return (
    <div className="content-board">
      <div className="board-content">
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
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
            <label htmlFor="password" className="form-label">
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
              placeholder="パスワードを入力"
              style={{ textTransform: "none" }}
            />
            {errors.password && (
              <div className="form-error">{errors.password}</div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading}
              className="form-button w-full text-center"
              style={{
                backgroundColor: "#3b82f6",
                borderColor: "#3b82f6",
                color: "white",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                  e.currentTarget.style.borderColor = "#2563eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                  e.currentTarget.style.borderColor = "#3b82f6";
                }
              }}
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p style={{ color: "#fff", fontSize: "0.9rem" }}>
            アカウントをお持ちでない方は{" "}
            <button
              onClick={onSwitchToRegister}
              className="font-medium transition-colors duration-200"
              style={{ color: "#fff", textDecoration: "underline" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#e5e7eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "white";
              }}
            >
              新規登録
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
