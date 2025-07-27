import { TaskList } from "@/components/TaskList";

export const MainContent = () => {
  return (
    <main className="main-content">
      <div className="content-board">
        <div className="board-header">
          <h3 className="board-title">Tasks</h3>
        </div>

        <div className="board-content">
          <TaskList />
        </div>
      </div>
    </main>
  );
};
