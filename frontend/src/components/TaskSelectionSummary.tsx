"use client";

import React from "react";
import { CheckSquare, Square, X, Target } from "lucide-react";

interface TaskSelectionSummaryProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onToggleSelectionMode: () => void;
  selectionMode: boolean;
}

export const TaskSelectionSummary = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onToggleSelectionMode,
  selectionMode,
}: TaskSelectionSummaryProps) => {
  const containerStyle = selectionMode
    ? {
        background: "var(--card)",
        border: "2px solid var(--primary)",
        boxShadow: "0 8px 25px var(--shadow), 0 0 20px rgba(139, 69, 19, 0.2)",
      }
    : {};

  return (
    <div className="task-opt-board" style={containerStyle}>
      <div
        className="flex items-center justify-between flex-wrap gap-4"
        style={{ minHeight: "3rem" }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div
            className="text-sm font-medium"
            style={{
              color: selectionMode
                ? "var(--primary)"
                : "var(--muted-foreground)",
            }}
          >
            <Target
              className="w-4 h-4 inline mr-2"
              style={{ color: "var(--primary)" }}
            />
            {selectionMode
              ? `${selectedCount}個のタスクを選択中 / 全${totalCount}個`
              : "タスクを選択すると取り組む順序の最適化を提案できます"}
          </div>

          {selectionMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={onSelectAll}
                className="form-button form-button-secondary"
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.8rem",
                  opacity: selectedCount === totalCount ? 0.5 : 1,
                  cursor:
                    selectedCount === totalCount ? "not-allowed" : "pointer",
                }}
                disabled={selectedCount === totalCount}
              >
                <CheckSquare className="w-3 h-3" />
                全選択
              </button>

              <button
                onClick={onClearSelection}
                className="form-button form-button-secondary"
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.8rem",
                  opacity: selectedCount === 0 ? 0.5 : 1,
                  cursor: selectedCount === 0 ? "not-allowed" : "pointer",
                }}
                disabled={selectedCount === 0}
              >
                <Square className="w-3 h-3" />
                全解除
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onToggleSelectionMode}
          className={
            selectionMode
              ? "form-button form-button-secondary"
              : "add-task-button"
          }
          style={
            selectionMode ? { padding: "0.5rem 1rem", fontSize: "0.8rem" } : {}
          }
        >
          {selectionMode ? (
            <>
              <X className="w-3 h-3" />
              選択終了
            </>
          ) : (
            "選択モード"
          )}
        </button>
      </div>
    </div>
  );
};
