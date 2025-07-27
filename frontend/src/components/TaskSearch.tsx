import { Search } from "lucide-react";

interface TaskSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const TaskSearch = ({ searchTerm, onSearchChange }: TaskSearchProps) => {
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
    </div>
  );
};
