import { useMemo } from "react";
import { Task } from "@/types/task";

type SortOption = "priority" | "deadline" | "duration" | "title" | "created_at";
type FilterOption = "all" | "todo" | "in_progress" | "completed" | "cancelled";

interface UseTaskFiltersProps {
  tasks: Task[];
  searchTerm: string;
  filterBy: FilterOption;
  sortBy: SortOption;
  sortOrder: "asc" | "desc";
}

export const useTaskFilters = ({
  tasks,
  searchTerm,
  filterBy,
  sortBy,
  sortOrder,
}: UseTaskFiltersProps) => {
  // フィルタリングとソート
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // 検索フィルタ
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ステータスフィルタ
    if (filterBy !== "all") {
      filtered = filtered.filter((task) => task.status === filterBy);
    }

    // ソート
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "priority":
          aValue = a.importance + a.urgency;
          bValue = b.importance + b.urgency;
          break;
        case "deadline":
          aValue = a.deadline ? new Date(a.deadline).getTime() : Infinity;
          bValue = b.deadline ? new Date(b.deadline).getTime() : Infinity;
          break;
        case "duration":
          aValue = a.duration;
          bValue = b.duration;
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [tasks, searchTerm, filterBy, sortBy, sortOrder]);

  // 統計情報
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const cancelled = tasks.filter((t) => t.status === "cancelled").length;
    const overdue = tasks.filter(
      (t) => t.deadline && new Date(t.deadline) < new Date()
    ).length;

    // タスク単体優先度の計算
    const low = tasks.filter((t) => t.importance + t.urgency <= 4).length;
    const medium = tasks.filter(
      (t) => t.importance + t.urgency > 4 && t.importance + t.urgency <= 6
    ).length;
    const high = tasks.filter(
      (t) => t.importance + t.urgency > 6 && t.importance + t.urgency <= 8
    ).length;
    const urgent = tasks.filter((t) => t.importance + t.urgency > 8).length;

    return {
      total,
      todo,
      inProgress,
      completed,
      cancelled,
      overdue,
      low,
      medium,
      high,
      urgent,
    };
  }, [tasks]);

  return {
    filteredAndSortedTasks,
    stats,
  };
};
