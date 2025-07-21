import { TaskList } from "@/components/TaskList";

export default function Home() {
  return (
    <div className="min-h-screen app-container">
      <div className="container mx-auto px-4 py-8">
        {/* アプリヘッダー */}
        <header className="app-header">
          <h2 className="app-title">
            <span className="app-title-main">TaskHakadoruGA</span>
            <span className="app-title-sub">タスク優先度提案アプリ</span>
          </h2>
        </header>

        {/* メインコンテンツ */}
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

        {/* フッター */}
        <footer className="app-footer">
          <div className="footer-content">
            <p>© {new Date().getFullYear()} TaskHakadoruGA</p>
            <p className="footer-sub">
              Created by Reo Kambara. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
