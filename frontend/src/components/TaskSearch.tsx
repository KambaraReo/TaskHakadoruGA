import { Search, Plus } from "lucide-react";

interface TaskSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddTask: () => void;
}

export const TaskSearch = ({
  searchTerm,
  onSearchChange,
  onAddTask,
}: TaskSearchProps) => {
  return (
    <div className="search-section">
      <div className="search-container">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder="タスクを検索..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      <button
        onClick={onAddTask}
        className="add-task-button"
        title="新しいタスクを追加"
      >
        <Plus className="w-4 h-4" />
        追加
      </button>
    </div>
  );
};
