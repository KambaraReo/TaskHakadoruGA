"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";
import { taskApi, ApiError } from "@/lib/api";

import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Loader2,
  AlertCircle,
  Clock,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = "priority" | "deadline" | "duration" | "title" | "created_at";
type FilterOption = "all" | "todo" | "in_progress" | "done";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [mounted, setMounted] = useState(false);

  // クライアントサイドでのみ実行
  useEffect(() => {
    setMounted(true);
  }, []);

  // タスク取得
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedTasks = await taskApi.getTasks();
        setTasks(fetchedTasks);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`API Error: ${err.message}`);
        } else {
          setError(
            err instanceof Error ? err.message : "Unknown error occurred"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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
    const done = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter(
      (t) => t.deadline && new Date(t.deadline) < new Date()
    ).length;

    // クエストランク（難易度）の計算
    const common = tasks.filter((t) => t.importance + t.urgency <= 4).length;
    const uncommon = tasks.filter(
      (t) => t.importance + t.urgency > 4 && t.importance + t.urgency <= 6
    ).length;
    const rare = tasks.filter(
      (t) => t.importance + t.urgency > 6 && t.importance + t.urgency <= 8
    ).length;
    const epic = tasks.filter((t) => t.importance + t.urgency > 8).length;

    return {
      total,
      todo,
      inProgress,
      done,
      overdue,
      common,
      uncommon,
      rare,
      epic,
    };
  }, [tasks]);

  const toggleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(option);
      setSortOrder("desc");
    }
  };

  // クライアントサイドでマウントされるまで何も表示しない
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>タスクを読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-red-600">
              エラーが発生しました
            </h3>
            <p className="text-gray-600">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-list-container">
      {/* タスク統計ボード */}
      <div className="task-stats-board">
        <div className="stats-header">
          <h3 className="stats-title">タスク状況</h3>
          <div className="stats-total">
            <Target className="h-4 w-4" />
            <span>総タスク数: {stats.total}</span>
          </div>
        </div>

        {/* 統計カード */}
        <div className="stats-grid">
          <div className="stat-card stat-pending">
            <div className="stat-number">{stats.todo}</div>
            <div className="stat-label">未着手</div>
          </div>
          <div className="stat-card stat-active">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">進行中</div>
          </div>
          <div className="stat-card stat-completed">
            <div className="stat-number">{stats.done}</div>
            <div className="stat-label">完了</div>
          </div>
          <div className="stat-card stat-overdue">
            <div className="stat-number">{stats.overdue}</div>
            <div className="stat-label">期限切れ</div>
          </div>
          <div className="stat-card stat-completion">
            <div className="stat-number">
              {Math.round((stats.done / stats.total) * 100) || 0}%
            </div>
            <div className="stat-label">完了率</div>
          </div>
        </div>

        {/* 優先度分布 */}
        <div className="priority-stats">
          <h4 className="priority-stats-title">優先度分布</h4>
          <div className="priority-stats-grid">
            <div className="priority-stat priority-low">
              <span className="priority-count">{stats.common}</span>
              <span className="priority-name">低</span>
            </div>
            <div className="priority-stat priority-medium">
              <span className="priority-count">{stats.uncommon}</span>
              <span className="priority-name">中</span>
            </div>
            <div className="priority-stat priority-high">
              <span className="priority-count">{stats.rare}</span>
              <span className="priority-name">高</span>
            </div>
            <div className="priority-stat priority-urgent">
              <span className="priority-count">{stats.epic}</span>
              <span className="priority-name">緊急</span>
            </div>
          </div>
        </div>
      </div>

      {/* 検索・フィルタ・ソート */}
      <div className="task-controls">
        {/* 検索バー */}
        <div className="search-section">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="タスクを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* コントロールパネル */}
        <div className="control-panel">
          {/* ステータスフィルタ */}
          <div className="control-section">
            <div className="control-header">
              <Filter className="control-icon" />
              <span className="control-label">ステータス</span>
            </div>
            <div className="filter-buttons">
              {(
                [
                  { key: "all", label: "全て" },
                  { key: "todo", label: "未着手" },
                  { key: "in_progress", label: "進行中" },
                  { key: "done", label: "完了" },
                ] as { key: FilterOption; label: string }[]
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterBy(key)}
                  className={cn(
                    "filter-button",
                    filterBy === key
                      ? "filter-button-active"
                      : "filter-button-inactive"
                  )}
                >
                  <span className="button-text">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 並び替え */}
          <div className="control-section">
            <div className="control-header">
              {sortOrder === "asc" ? (
                <SortAsc className="control-icon" />
              ) : (
                <SortDesc className="control-icon" />
              )}
              <span className="control-label">並び替え</span>
            </div>
            <div className="sort-buttons">
              {(
                [
                  { key: "priority", label: "優先度" },
                  { key: "deadline", label: "締切" },
                  { key: "duration", label: "所要時間" },
                  { key: "title", label: "タイトル" },
                  { key: "created_at", label: "作成日" },
                ] as { key: SortOption; label: string }[]
              ).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleSort(key)}
                  className={cn(
                    "sort-button",
                    sortBy === key
                      ? "sort-button-active"
                      : "sort-button-inactive"
                  )}
                >
                  <span className="button-text">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* タスク一覧 */}
      {filteredAndSortedTasks.length === 0 ? (
        <div className="empty-task-board">
          <div className="empty-icon">
            <Clock className="empty-clock" />
          </div>
          <div className="empty-content">
            <h3 className="empty-title">
              {searchTerm || filterBy !== "all"
                ? "該当するタスクが見つかりません"
                : "現在、タスクはありません"}
            </h3>
            <p className="empty-description">
              {searchTerm || filterBy !== "all"
                ? "検索条件を変更して再度お試しください"
                : "新しいタスクを追加してみましょう"}
            </p>
          </div>
        </div>
      ) : (
        <div className="task-cards-grid">
          {filteredAndSortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
