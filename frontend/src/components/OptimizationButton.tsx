"use client";

import React from "react";
import { RotateCwSquare } from "lucide-react";
import { OptimizationModal } from "./OptimizationModal";
import { useOptimizationModal } from "../hooks/useOptimizationModal";
import { optimizerApi } from "../lib/api";
import { Task } from "../types/task";
import toast from "react-hot-toast";

interface OptimizationButtonProps {
  selectedTasks: Task[];
  onClearSelection: () => void;
  exitSelectionMode: () => void;
  canOptimize: boolean;
}

export const OptimizationButton = ({
  selectedTasks,
  onClearSelection,
  exitSelectionMode,
  canOptimize,
}: OptimizationButtonProps) => {
  const {
    isOpen,
    currentStep,
    params,
    optimizationResult,
    error,
    openModal,
    closeModal,
    nextStep,
    prevStep,
    updateParams,
    setCurrentStep,
    setOptimizationResult,
    setError,
  } = useOptimizationModal();

  const handleStartOptimization = async () => {
    try {
      setError(null);

      // 最適化APIを呼び出し
      const result = await optimizerApi.optimizeTasks({
        tasks: selectedTasks,
        weights: params.weights,
        detailed: params.detailed,
        maxSolutions: params.maxSolutions,
      });

      setOptimizationResult(result);
      setCurrentStep("results");

      toast.success("最適化が完了しました！");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "最適化に失敗しました";
      setError(errorMessage);
      setCurrentStep("results");

      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="optimization-fab">
        <button
          onClick={openModal}
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
            <span className="optimization-count-badge">
              {selectedTasks.length}個
            </span>
          )}
        </button>
      </div>

      <OptimizationModal
        isOpen={isOpen}
        currentStep={currentStep}
        selectedTasks={selectedTasks}
        onClearSelection={onClearSelection}
        exitSelectionMode={exitSelectionMode}
        params={params}
        optimizationResult={optimizationResult}
        error={error}
        onClose={closeModal}
        onNext={nextStep}
        onPrev={prevStep}
        onParamsUpdate={updateParams}
        onStartOptimization={handleStartOptimization}
      />
    </>
  );
};
