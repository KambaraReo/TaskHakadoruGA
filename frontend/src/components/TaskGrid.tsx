import { Clock } from "lucide-react";
import { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";

interface TaskGridProps {
  tasks: Task[];
  searchTerm: string;
  filterBy: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  selectionMode?: boolean;
  selectedTaskIds?: number[];
  onToggleSelection?: (taskId: number) => void;
}

export const TaskGrid = ({
  tasks,
  searchTerm,
  filterBy,
  onEditTask,
  onDeleteTask,
  selectionMode = false,
  selectedTaskIds = [],
  onToggleSelection,
}: TaskGridProps) => {
  if (tasks.length === 0) {
    return (
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
    );
  }

  return (
    <div className="task-grid-container">
      <div className="task-cards-grid">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            selectionMode={selectionMode}
            isSelected={selectedTaskIds.includes(task.id)}
            onToggleSelection={onToggleSelection}
          />
        ))}
      </div>
    </div>
  );
};
