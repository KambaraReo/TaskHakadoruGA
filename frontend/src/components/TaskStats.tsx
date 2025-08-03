interface TaskStatsProps {
  stats: {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export const TaskStats = ({ stats }: TaskStatsProps) => {
  return (
    <div className="task-stats-board">
      <div className="stats-header">
        <h3 className="stats-title">タスク状況</h3>
      </div>

      {/* 統計カード */}
      <div className="stats-total">
        <h4>総タスク件数： {stats.total}件</h4>
      </div>
      <div className="stats-grid">
        <div className="stat-card stat-pending">
          <div className="stat-label">未着手</div>
          <div className="stat-number">{stats.todo}</div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-label">進行中</div>
          <div className="stat-number">{stats.inProgress}</div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-label">完了</div>
          <div className="stat-number">{stats.completed}</div>
        </div>
        <div className="stat-card stat-cancelled">
          <div className="stat-label">キャンセル</div>
          <div className="stat-number">{stats.cancelled}</div>
        </div>
        <div className="stat-card stat-overdue">
          <div className="stat-label">期限切れ</div>
          <div className="stat-number">{stats.overdue}</div>
        </div>
        <div className="stat-card stat-completion">
          <div className="stat-label">完了率</div>
          <div className="stat-number">
            {Math.round((stats.completed / stats.total) * 100) || 0}%
          </div>
        </div>
      </div>

      {/* タスク単体の優先度分布 */}
      <div className="priority-stats">
        <h4 className="priority-stats-title">タスク単体の優先度分布</h4>
        <div className="priority-stats-grid">
          <div className="priority-stat priority-low">
            <span className="priority-name">低</span>
            <span className="priority-count">{stats.low}</span>
          </div>
          <div className="priority-stat priority-medium">
            <span className="priority-name">中</span>
            <span className="priority-count">{stats.medium}</span>
          </div>
          <div className="priority-stat priority-high">
            <span className="priority-name">高</span>
            <span className="priority-count">{stats.high}</span>
          </div>
          <div className="priority-stat priority-urgent">
            <span className="priority-name">緊急</span>
            <span className="priority-count">{stats.urgent}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
