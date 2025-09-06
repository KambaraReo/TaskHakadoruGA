"use client";

import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header-content">
        <h2 className="app-title">
          <span className="app-title-main">TaskHakadoruGA</span>
        </h2>

        {isAuthenticated && user && (
          <div className="flex items-center space-x-4">
            <span
              className="text-sm font-medium"
              style={{
                color: "#f5e6d3",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <User />
                <div
                  style={{
                    lineHeight: "normal",
                    fontFamily: "cursive",
                  }}
                >
                  {user.name}
                </div>
              </div>
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:transform hover:scale-105"
              style={{
                backgroundColor: "var(--priority-urgent)",
                color: "white",
                border: "2px solid var(--priority-urgent)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#b91c1c";
                e.currentTarget.style.borderColor = "#b91c1c";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(185, 28, 28, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--priority-urgent)";
                e.currentTarget.style.borderColor = "var(--priority-urgent)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
