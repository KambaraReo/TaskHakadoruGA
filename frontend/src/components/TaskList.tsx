"use client";

import React, { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { TaskStats } from "./TaskStats";
import { TaskSearch } from "./TaskSearch";
import { TaskControls } from "./TaskControls";
import { TaskGrid } from "./TaskGrid";
import { LoadingState, ErrorState } from "./TaskLoadingStates";

type SortOption = "priority" | "deadline" | "duration" | "created_at";
type FilterOption = "all" | "todo" | "in_progress" | "done";

export const TaskList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

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
        <TaskSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
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
      />
    </div>
  );
};
