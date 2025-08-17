import { useState, useCallback } from "react";

export interface UseTaskSelectionReturn {
  selectedTaskIds: number[];
  isSelected: (taskId: number) => boolean;
  toggleSelection: (taskId: number) => void;
  selectAll: (taskIds: number[]) => void;
  clearSelection: () => void;
  selectedCount: number;
  canOptimize: boolean;
}

export const useTaskSelection = (): UseTaskSelectionReturn => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

  const isSelected = useCallback(
    (taskId: number) => {
      return selectedTaskIds.includes(taskId);
    },
    [selectedTaskIds]
  );

  const toggleSelection = useCallback((taskId: number) => {
    setSelectedTaskIds((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  }, []);

  const selectAll = useCallback((taskIds: number[]) => {
    setSelectedTaskIds(taskIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
  }, []);

  const selectedCount = selectedTaskIds.length;
  const canOptimize = selectedCount >= 2;

  return {
    selectedTaskIds,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    selectedCount,
    canOptimize,
  };
};
