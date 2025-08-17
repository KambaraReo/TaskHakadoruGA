"use client";

import React from "react";
import { RotateCwSquare } from "lucide-react";

interface OptimizationButtonProps {
  selectedCount: number;
  canOptimize: boolean;
  onOptimize: () => void;
}

export const OptimizationButton = ({
  selectedCount,
  canOptimize,
  onOptimize,
}: OptimizationButtonProps) => {
  return (
    <div className="optimization-fab">
      <button
        onClick={onOptimize}
        disabled={!canOptimize}
        className={`optimization-button ${
          canOptimize
            ? "optimization-button-active"
            : "optimization-button-inactive"
        }`}
        title={
          canOptimize
            ? "選択したタスクの順序を最適化します"
            : "2個以上のタスクを選択してください"
        }
      >
        <div className="optimization-button-content">
          <RotateCwSquare
            className={`w-5 h-5 ${canOptimize ? "animate-pulse" : ""}`}
          />
          <span>タスク順序の最適化</span>
        </div>
        {canOptimize && (
          <span className="optimization-count-badge">{selectedCount}個</span>
        )}
      </button>
    </div>
  );
};
