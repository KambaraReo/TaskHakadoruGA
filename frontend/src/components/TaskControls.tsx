import { Filter, SortAsc, SortDesc } from "lucide-react";
import { cn } from "@/lib/utils";

type SortOption = "priority" | "deadline" | "duration" | "created_at";
type FilterOption = "all" | "todo" | "in_progress" | "completed" | "cancelled";

interface TaskControlsProps {
  filterBy: FilterOption;
  sortBy: SortOption;
  sortOrder: "asc" | "desc";
  onFilterChange: (filter: FilterOption) => void;
  onSortChange: (sort: SortOption) => void;
  onSortOrderToggle: () => void;
}

export const TaskControls = ({
  filterBy,
  sortBy,
  sortOrder,
  onFilterChange,
  onSortChange,
  onSortOrderToggle,
}: TaskControlsProps) => {
  return (
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
              { key: "completed", label: "完了" },
              { key: "cancelled", label: "キャンセル" },
            ] as { key: FilterOption; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onFilterChange(key)}
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
          <button
            onClick={onSortOrderToggle}
            className="sort-order-toggle"
            title={sortOrder === "asc" ? "昇順" : "降順"}
          >
            {sortOrder === "asc" ? (
              <SortAsc className="control-icon" />
            ) : (
              <SortDesc className="control-icon" />
            )}
          </button>
          <span className="control-label">並び替え</span>
        </div>
        <div className="sort-buttons">
          {(
            [
              { key: "priority", label: "優先度" },
              { key: "deadline", label: "締切" },
              { key: "duration", label: "所要時間" },
              { key: "created_at", label: "作成日" },
            ] as { key: SortOption; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onSortChange(key)}
              className={cn(
                "sort-button",
                sortBy === key ? "sort-button-active" : "sort-button-inactive"
              )}
            >
              <span className="button-text">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
