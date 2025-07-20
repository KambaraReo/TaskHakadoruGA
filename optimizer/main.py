from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from dotenv import load_dotenv
import logging

load_dotenv()

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Task Optimizer API",
    description="タスク優先順位最適化API",
    version="1.0.0"
)

class Task(BaseModel):
    """Railsで定義されたTaskモデルに対応するPydanticモデル"""
    id: int
    title: str
    description: Optional[str] = None
    deadline: Optional[str] = None  # ISO形式の日時文字列
    duration: int  # 分単位
    energy_required: int = 5  # 1-10
    importance: int = 3  # 1-5
    urgency: int = 3  # 1-5
    ease: int = 3  # 1-5
    status: str = "todo"
    dependencies: List[int] = []

class OptimizeRequest(BaseModel):
    """最適化リクエストのモデル"""
    tasks: List[Task]

class OptimizedTask(BaseModel):
    """最適化結果のタスクモデル"""
    id: int
    title: str
    priority_score: float
    rank: int
    original_task: Task

class OptimizeResponse(BaseModel):
    """最適化レスポンスのモデル"""
    optimized_tasks: List[OptimizedTask]
    total_tasks: int
    algorithm_used: str
    execution_time_ms: float

@app.get("/")
def root():
    """ヘルスチェック用エンドポイント"""
    return {
        "message": "Task Optimizer API is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.post("/optimize", response_model=OptimizeResponse)
def optimize_tasks(request: OptimizeRequest):
    """
    タスクの優先順位を最適化するエンドポイント

    Args:
        request: 最適化対象のタスクリスト

    Returns:
        OptimizeResponse: 最適化されたタスクリスト
    """
    try:
        import time
        start_time = time.time()

        logger.info(f"最適化開始: {len(request.tasks)}件のタスク")

        # 入力検証
        if not request.tasks:
            raise HTTPException(status_code=400, detail="タスクリストが空です")

        # 仮のアルゴリズムを実装
        # 重要度 + 緊急度の単純なスコアリング
        optimized_tasks = []

        for i, task in enumerate(request.tasks):
            # 仮のスコアリング: 重要度 + 緊急度 - (容易さの逆数) + エネルギー効率
            priority_score = (
                task.importance * 2.0 +  # 重要度を重視
                task.urgency * 1.5 +     # 緊急度
                (6 - task.ease) * 0.5 +  # 難易度（easeが低いほど高スコア）
                (11 - task.energy_required) * 0.3  # エネルギー効率
            )

            optimized_tasks.append({
                'task': task,
                'score': priority_score
            })

        # スコア順でソート（降順）
        optimized_tasks.sort(key=lambda x: x['score'], reverse=True)

        # レスポンス形式に変換
        result_tasks = []
        for rank, item in enumerate(optimized_tasks, 1):
            result_tasks.append(OptimizedTask(
                id=item['task'].id,
                title=item['task'].title,
                priority_score=round(item['score'], 2),
                rank=rank,
                original_task=item['task']
            ))

        execution_time = (time.time() - start_time) * 1000  # ミリ秒

        logger.info(f"最適化完了: 実行時間 {execution_time:.2f}ms")

        return OptimizeResponse(
            optimized_tasks=result_tasks,
            total_tasks=len(result_tasks),
            algorithm_used="Simple Priority Scoring (importance + urgency + ease + energy)",
            execution_time_ms=round(execution_time, 2)
        )

    except Exception as e:
        logger.error(f"最適化エラー: {str(e)}")
        raise HTTPException(status_code=500, detail=f"最適化処理でエラーが発生しました: {str(e)}")

@app.get("/health")
def health_check():
    """詳細なヘルスチェック"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "task-optimizer",
        "version": "1.0.0"
    }
