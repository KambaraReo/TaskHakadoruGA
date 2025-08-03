"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { TaskStats } from "./TaskStats";
import { TaskSearch } from "./TaskSearch";
import { TaskControls } from "./TaskControls";
import { TaskGrid } from "./TaskGrid";
import { LoadingState, ErrorState } from "./TaskLoadingStates";
import { Modal } from "./Modal";
import { TaskForm, TaskFormData } from "./TaskForm";
import { taskApi } from "@/lib/api";
import { Task } from "@/types/task";

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
      if (editingTask) {
        // 編集モード
        await taskApi.updateTask(editingTask.id, taskData);
      } else {
        // 新規作成モード
        await taskApi.createTask(taskData);
      }

      // タスク一覧を再取得
      await refetch();
      handleCloseModal();
    } catch (error) {
      console.error("タスクの保存に失敗しました:", error);
      // エラーハンドリング（必要に応じてトースト通知など）
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
    } catch (error) {
      console.error("タスクの削除に失敗しました:", error);
      // エラーハンドリング（必要に応じてトースト通知など）
    }
  };

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

      <TaskGrid
        tasks={filteredAndSortedTasks}
        searchTerm={searchTerm}
        filterBy={filterBy}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
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
    </div>
  );
};
