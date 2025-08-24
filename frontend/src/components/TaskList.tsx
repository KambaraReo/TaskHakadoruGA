"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { useTaskSelection } from "@/hooks/useTaskSelection";
import { TaskStats } from "./TaskStats";
import { TaskSearch } from "./TaskSearch";
import { TaskControls } from "./TaskControls";
import { TaskGrid } from "./TaskGrid";
import { TaskSelectionSummary } from "./TaskSelectionSummary";
import { OptimizationButton } from "./OptimizationButton";
import { LoadingState, ErrorState } from "./TaskLoadingStates";
import { Modal } from "./Modal";
import { TaskForm, TaskFormData } from "./TaskForm";
import { taskApi } from "@/lib/api";
import { Task } from "@/types/task";
import toast from "react-hot-toast";

type SortOption = "priority" | "deadline" | "duration" | "created_at";
type FilterOption = "all" | "todo" | "in_progress" | "completed" | "cancelled";

export const TaskList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  // モーダル状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 選択モード状態
  const [selectionMode, setSelectionMode] = useState(false);

  // 選択機能
  const {
    selectedTaskIds,
    toggleSelection,
    selectAll,
    clearSelection,
    selectedCount,
    canOptimize,
  } = useTaskSelection();

  // カスタムフックを使用
  const { tasks, loading, error, mounted, refetch } = useTasks();
  const { filteredAndSortedTasks, stats } = useTaskFilters({
    tasks,
    searchTerm,
    filterBy,
    sortBy,
    sortOrder,
  });

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // モーダル関連の処理
  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setIsSubmitting(false);
  };

  const handleSubmitTask = async (taskData: TaskFormData) => {
    setIsSubmitting(true);
    try {
      // TaskFormDataをTask型に変換
      const taskPayload = {
        title: taskData.title,
        description: taskData.description || "",
        importance: taskData.importance,
        urgency: taskData.urgency,
        duration: taskData.duration,
        energy_required: taskData.energy_required,
        ease: taskData.ease,
        deadline: taskData.deadline || undefined,
        dependencies: taskData.dependencies,
        status: taskData.status,
      };

      if (editingTask) {
        // 編集
        await taskApi.updateTask(editingTask.id, taskPayload);
      } else {
        // 新規作成
        await taskApi.createTask(taskPayload);
      }

      // タスク一覧を再取得
      await refetch();
      handleCloseModal();

      // 成功トースト
      toast.success(
        editingTask ? "タスクを更新しました" : "タスクを作成しました"
      );
    } catch (error) {
      console.error("タスクの保存に失敗しました:", error);
      // エラートースト
      toast.error(
        `タスクの保存に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("このタスクを削除しますか？")) {
      return;
    }

    try {
      await taskApi.deleteTask(taskId);
      await refetch();
      toast.success("タスクを削除しました");
    } catch (error) {
      console.error("タスクの削除に失敗しました:", error);
      toast.error(
        `タスクの削除に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      );
    }
  };

  // 選択関連の処理
  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      clearSelection();
    }
  };

  const handleSelectAll = () => {
    const allTaskIds = filteredAndSortedTasks.map((task) => task.id);
    selectAll(allTaskIds);
  };

  // 選択されたタスクを取得
  const selectedTasks = filteredAndSortedTasks.filter((task) =>
    selectedTaskIds.includes(task.id)
  );

  // クライアントサイドでマウントされるまで何も表示しない
  if (!mounted) {
    return null;
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="task-list-container">
      <TaskStats stats={stats} />

      <div className="task-controls">
        <TaskSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddTask={handleAddTask}
        />
        <TaskControls
          filterBy={filterBy}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onFilterChange={setFilterBy}
          onSortChange={handleSortChange}
          onSortOrderToggle={handleSortOrderToggle}
        />
      </div>

      {/* 選択サマリー */}
      <TaskSelectionSummary
        selectedCount={selectedCount}
        totalCount={filteredAndSortedTasks.length}
        onSelectAll={handleSelectAll}
        onClearSelection={clearSelection}
        onToggleSelectionMode={handleToggleSelectionMode}
        selectionMode={selectionMode}
      />

      <TaskGrid
        tasks={filteredAndSortedTasks}
        searchTerm={searchTerm}
        filterBy={filterBy}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        selectionMode={selectionMode}
        selectedTaskIds={selectedTaskIds}
        onToggleSelection={toggleSelection}
      />

      {/* タスクフォームモーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? "タスクを編集" : "新しいタスクを追加"}
      >
        <TaskForm
          task={editingTask}
          onSubmit={handleSubmitTask}
          onCancel={handleCloseModal}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* 最適化ボタン（選択モード時のみ表示） */}
      {selectionMode && (
        <OptimizationButton
          selectedTasks={selectedTasks}
          onClearSelection={clearSelection}
          exitSelectionMode={() => setSelectionMode(false)}
          canOptimize={canOptimize}
        />
      )}
    </div>
  );
};
