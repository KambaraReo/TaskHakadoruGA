import { Task } from "@/types/task";

// 優先度ランクの型定義
export interface PriorityRank {
  rank: "low" | "medium" | "high" | "urgent";
  name: string;
  color: string;
  cardClass: string;
}

// 難易度レベルの型定義
export interface DifficultyLevel {
  text: string;
  level: "very-hard" | "hard" | "normal" | "easy" | "very-easy";
}

// 締切状態の型定義
export type DeadlineStatus = "none" | "normal" | "urgent" | "overdue";

// 優先度ランクを計算
export const getPriorityRank = (
  importance: number,
  urgency: number
): PriorityRank => {
  const priorityScore = importance + urgency;

  if (priorityScore <= 4) {
    return {
      rank: "low",
      name: "低",
      color: "priority-badge-low",
      cardClass: "task-card priority-low",
    };
  }
  if (priorityScore <= 6) {
    return {
      rank: "medium",
      name: "中",
      color: "priority-badge-medium",
      cardClass: "task-card priority-medium",
    };
  }
  if (priorityScore <= 8) {
    return {
      rank: "high",
      name: "高",
      color: "priority-badge-high",
      cardClass: "task-card priority-high",
    };
  }
  return {
    rank: "urgent",
    name: "緊急",
    color: "priority-badge-urgent",
    cardClass: "task-card priority-urgent",
  };
};

// 難易度レベルを取得
export const getDifficultyLevel = (ease: number): DifficultyLevel => {
  if (ease === 5) return { text: "とても簡単", level: "very-easy" };
  if (ease === 4) return { text: "簡単", level: "easy" };
  if (ease === 3) return { text: "普通", level: "normal" };
  if (ease === 2) return { text: "難しい", level: "hard" };
  return { text: "とても難しい", level: "very-hard" };
};

// 締切状態を判定
export const getDeadlineStatus = (deadline?: string): DeadlineStatus => {
  if (!deadline) return "none";

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  if (deadlineDate < now) return "overdue";
  if (deadlineDate < threeDaysFromNow) return "urgent";
  return "normal";
};

// 所要時間をフォーマット
export const formatDuration = (minutes: number): string => {
  const hours = minutes / 60;
  return `${hours.toFixed(2).replace(/\.?0+$/, "")}h`;
};

// ステータス設定を取得
export const getStatusConfig = (status: Task["status"]) => {
  switch (status) {
    case "completed":
      return {
        label: "完了",
        badgeClass: "status-badge status-completed",
      };
    case "in_progress":
      return {
        label: "進行中",
        badgeClass: "status-badge status-active",
      };
    case "cancelled":
      return {
        label: "キャンセル",
        badgeClass: "status-badge status-cancelled",
      };
    default:
      return {
        label: "未着手",
        badgeClass: "status-badge status-pending",
      };
  }
};
