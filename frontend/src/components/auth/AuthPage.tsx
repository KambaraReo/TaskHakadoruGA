"use client";

import React, { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

type AuthMode = "login" | "register";

import { Header } from "@/components/Header";

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="min-h-screen app-container">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-full max-w-md">
            {mode === "login" ? (
              <LoginForm onSwitchToRegister={() => setMode("register")} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setMode("login")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
