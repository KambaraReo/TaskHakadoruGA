"use client";

import React from "react";
import { Task } from "@/types/task";
import {
  Clock,
  Calendar,
  Zap,
  AlertTriangle,
  Target,
  TrendingUp,
  Shield,
  Trash2,
} from "lucide-react";
import { format, isBefore, addDays } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  className?: string;
  onDelete?: (taskId: number) => void;
}

export const TaskCard = ({ task, className, onDelete }: TaskCardProps) => {
  // 優先度の計算（重要度 + 緊急度）
  const priorityScore = task.importance + task.urgency;

  // 優先度ラベルの決定
  const getPriorityRank = () => {
    if (priorityScore <= 4)
      return {
        rank: "low",
        name: "低",
        color: "priority-badge-low",
        cardClass: "task-card priority-low",
      };
    if (priorityScore <= 6)
      return {
        rank: "medium",
        name: "中",
        color: "priority-badge-medium",
        cardClass: "task-card priority-medium",
      };
    if (priorityScore <= 8)
      return {
        rank: "high",
        name: "高",
        color: "priority-badge-high",
        cardClass: "task-card priority-high",
      };
    return {
      rank: "urgent",
      name: "緊急",
      color: "priority-badge-urgent",
      cardClass: "task-card priority-urgent",
    };
  };

  const priorityRank = getPriorityRank();

  // 締切の状態を判定
  const getDeadlineStatus = () => {
    if (!task.deadline) return "none";

    const deadline = new Date(task.deadline);
    const now = new Date();
    const threeDaysFromNow = addDays(now, 3);

    if (isBefore(deadline, now)) return "overdue";
    if (isBefore(deadline, threeDaysFromNow)) return "urgent";
    return "normal";
  };

  const deadlineStatus = getDeadlineStatus();

  // ステータスに応じた設定
  const getStatusConfig = () => {
    switch (task.status) {
      case "done":
        return {
          label: "完了",
          badgeClass: "status-badge status-completed",
        };
      case "in_progress":
        return {
          label: "進行中",
          badgeClass: "status-badge status-active",
        };
      default:
        return {
          label: "未着手",
          badgeClass: "status-badge status-pending",
        };
    }
  };

  const statusConfig = getStatusConfig();

  const formatDuration = (minutes: number) => {
    // 時間/分で表示
    // const hours = Math.floor(minutes / 60);
    // const mins = minutes % 60;
    // if (hours > 0) {
    //   return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
    // }
    // return `${mins}分`;

    // 時間で表示
    const hours = minutes / 60;
    // 小数点以下2桁まで表示し、末尾の0は削除
    return `${hours.toFixed(2).replace(/\.?0+$/, "")}h`;
  };

  // 難易度レベル表示
  const getDifficultyLevel = (ease: number) => {
    if (ease >= 4) return { text: "簡単", level: "easy" };
    if (ease >= 3) return { text: "普通", level: "normal" };
    return { text: "難しい", level: "hard" };
  };

  const difficultyLevel = getDifficultyLevel(task.ease);

  return (
    <div className={cn(priorityRank.cardClass, className)}>
      {/* タスクカードヘッダー */}
      <div className="task-card-header">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="task-card-title line-clamp-2">
              #{task.id} {task.title}
            </h3>
            {task.description && (
              <p className="text-sm opacity-75 line-clamp-2 mt-1">
                {task.description}
              </p>
            )}
          </div>
          <div className={`priority-badge ${priorityRank.color}`}>
            <span>{priorityRank.name}</span>
          </div>
        </div>
      </div>

      <div className="task-card-content">
        {/* タスク詳細情報 */}
        <div className="space-y-2 h-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-2">
            {/* 重要度 */}
            <div className="task-stat">
              <Target className="task-stat-icon" />
              <span>重要度</span>
              <div className="task-stat-value importance-value px-2 py-1 rounded text-xs font-bold ml-auto">
                {task.importance}/5
              </div>
            </div>

            {/* 緊急度 */}
            <div className="task-stat">
              <AlertTriangle className="task-stat-icon" />
              <span>緊急度</span>
              <div className="task-stat-value urgency-value px-2 py-1 rounded text-xs font-bold ml-auto">
                {task.urgency}/5
              </div>
            </div>

            {/* 所要時間 */}
            <div className="task-stat">
              <Clock className="task-stat-icon" />
              <span>所要時間</span>
              <div className="task-stat-value duration-value px-2 py-1 rounded font-bold ml-auto text-xs">
                {formatDuration(task.duration)}
              </div>
            </div>

            {/* エネルギー */}
            <div className="task-stat">
              <Zap className="task-stat-icon" />
              <span>エネルギー</span>
              <div className="task-stat-value energy-value px-2 py-1 rounded font-bold ml-auto text-xs">
                {task.energy_required}/10
              </div>
            </div>

            {/* 難易度 */}
            <div className="task-stat">
              <Shield className="task-stat-icon" />
              <span>難易度</span>
              <div className="task-stat-value difficulty-value px-2 py-1 rounded text-xs font-bold ml-auto">
                {difficultyLevel.text}
              </div>
            </div>
          </div>

          {/* 期限 */}
          {task.deadline && (
            <div className="task-stat flex-wrap">
              <Calendar className="task-stat-icon" />
              <span>期限</span>
              <div
                className={cn(
                  "px-2 py-1 rounded text-xs font-bold ml-auto",
                  deadlineStatus === "overdue"
                    ? "deadline-overdue"
                    : deadlineStatus === "urgent"
                    ? "deadline-urgent"
                    : "deadline-normal"
                )}
              >
                {format(new Date(task.deadline), "MM/dd HH:mm", {
                  locale: ja,
                })}
                {deadlineStatus === "overdue" && " (期限切れ)"}
                {deadlineStatus === "urgent" && " (間近)"}
              </div>
            </div>
          )}

          {/* 依存関係 */}
          {task.dependencies.length > 0 && (
            <div className="task-stat flex-wrap !mt-4">
              <TrendingUp className="task-stat-icon" />
              <span>依存タスク</span>
              <div className="flex gap-1 flex-wrap ml-auto">
                {task.dependencies.map((depId) => (
                  <span key={depId} className="dependency-tag">
                    #{depId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* タスクフッター */}
      <div className="task-footer">
        <div className={statusConfig.badgeClass}>
          <span>{statusConfig.label}</span>
        </div>

        <button
          onClick={() => onDelete?.(task.id)}
          className="delete-button p-2 rounded-full hover:bg-red-300 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
          title="タスクを削除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
