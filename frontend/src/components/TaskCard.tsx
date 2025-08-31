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
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  getPriorityRank,
  getDifficultyLevel,
  getDeadlineStatus,
  formatDuration,
  getStatusConfig,
} from "@/utils/taskUtils";

interface TaskCardProps {
  task: Task;
  className?: string;
  onDelete?: (taskId: number) => void;
  onEdit?: (task: Task) => void;
  isSelected?: boolean;
  onToggleSelection?: (taskId: number) => void;
  selectionMode?: boolean;
}

export const TaskCard = ({
  task,
  className,
  onDelete,
  onEdit,
  isSelected = false,
  onToggleSelection,
  selectionMode = false,
}: TaskCardProps) => {
  // ユーティリティ関数を使用
  const priorityRank = getPriorityRank(task.importance, task.urgency);
  const deadlineStatus = getDeadlineStatus(task.deadline);
  const statusConfig = getStatusConfig(task.status);
  const difficultyLevel = getDifficultyLevel(task.ease);

  const handleCardClick = () => {
    if (selectionMode) {
      onToggleSelection?.(task.id);
    } else {
      onEdit?.(task);
    }
  };

  return (
    <div
      className={cn(
        priorityRank.cardClass,
        className,
        "cursor-pointer",
        selectionMode &&
          isSelected &&
          "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20",
        selectionMode && "hover:ring-1 hover:ring-blue-300"
      )}
      onClick={handleCardClick}
    >
      {/* タスクカードヘッダー */}
      <div className="task-card-header">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            {selectionMode && (
              <div className="flex-shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelection?.(task.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}
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
          </div>
          <div className={`priority-badge ${priorityRank.color}`}>
            <span>{priorityRank.name}</span>
          </div>
        </div>
      </div>

      <div className="task-card-content">
        {/* タスク詳細情報 */}
        <div className="space-y-2 h-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          </div>

          {/* 難易度 */}
          <div className="task-stat flex-wrap">
            <Shield className="task-stat-icon" />
            <span>難易度</span>
            <div className="task-stat-value difficulty-value px-2 py-1 rounded text-xs font-bold ml-auto">
              {difficultyLevel.text}
            </div>
          </div>

          {/* 期限 */}
          {task.deadline && (
            <div className="task-stat flex-wrap !mt-4">
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
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(task.id);
          }}
          className="delete-button p-2 rounded-full hover:bg-red-300 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
          title="タスクを削除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
