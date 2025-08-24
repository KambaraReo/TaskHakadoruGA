import { useState } from "react";
import { OptimizeResponse } from "../lib/api";

export type OptimizationStep =
  | "confirmation"
  | "parameters"
  | "processing"
  | "results";

export interface OptimizationWeights {
  importance: number;
  urgency: number;
  ease: number;
  energy: number;
  time: number;
}

export interface OptimizationParams {
  weights: OptimizationWeights;
  detailed: boolean;
  maxSolutions: number;
}

export const useOptimizationModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] =
    useState<OptimizationStep>("confirmation");
  const [params, setParams] = useState<OptimizationParams>({
    weights: {
      importance: 3.0,
      urgency: 2.0,
      ease: 1.0,
      energy: 2.0,
      time: 1.5,
    },
    detailed: false,
    maxSolutions: 1,
  });
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openModal = () => {
    setIsOpen(true);
    setCurrentStep("confirmation");
  };

  const closeModal = () => {
    setIsOpen(false);
    setCurrentStep("confirmation");
    setOptimizationResult(null);
    setError(null);
  };

  const nextStep = () => {
    const steps: OptimizationStep[] = [
      "confirmation",
      "parameters",
      "processing",
      "results",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: OptimizationStep[] = [
      "confirmation",
      "parameters",
      "processing",
      "results",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const updateParams = (newParams: Partial<OptimizationParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  return {
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
  };
};
