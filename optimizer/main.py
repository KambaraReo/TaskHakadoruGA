from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Union
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

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],  # フロントエンドのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

class OptimizationWeights(BaseModel):
  """最適化重み設定のモデル"""
  importance: float = 3.0
  urgency: float = 2.0
  ease: float = 1.0
  energy: float = 2.0
  time: float = 1.5

class OptimizeRequest(BaseModel):
  """最適化リクエストのモデル"""
  tasks: List[Task]
  weights: Optional[OptimizationWeights] = None
  detailed: bool = False  # 詳細結果を返すかどうか
  max_solutions: int = 1  # 返却する解の数（1=最良解のみ、10=上位10解）

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

class DetailedOptimizeResponse(BaseModel):
  """詳細最適化レスポンスのモデル"""
  algorithm: str
  parameters: dict
  solutions: List[dict]
  total_solutions: int
  best_solution: Optional[dict]
  execution_time_ms: float

@app.get("/")
def root():
  """ヘルスチェック用エンドポイント"""
  return {
    "message": "Task Optimizer API is running",
    "version": "1.0.0",
    "status": "healthy"
  }

@app.get("/health")
def health_check():
  """詳細なヘルスチェック"""
  return {
    "status": "healthy",
    "timestamp": datetime.now().isoformat(),
    "service": "task-optimizer",
    "version": "1.0.0"
  }

@app.post("/optimizer/optimize", response_model=Union[OptimizeResponse, dict])
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

    # タスクを辞書形式に変換
    tasks_dict = [task.dict() for task in request.tasks]

    # 重み設定を辞書形式に変換
    weights_dict = None
    if request.weights:
      weights_dict = request.weights.dict()

    # NSGA-II多目的最適化を実行
    from optimizer import run_nsga2_optimization

    nsga2_result = run_nsga2_optimization(
      tasks_dict,
      pop_size=min(50, len(request.tasks) * 10),  # タスク数に応じて調整
      n_gen=min(100, 50 + len(request.tasks) * 5),  # タスク数に応じて調整
      weights=weights_dict
    )

    # 最良解を取得
    best_solution = nsga2_result["best_solution"]
    if not best_solution:
      raise HTTPException(status_code=500, detail="最適化解が見つかりませんでした")

    # レスポンス形式に変換
    result_tasks = []
    for task_info in best_solution["task_order"]:
      # 元のタスク情報を取得
      original_task = next(task for task in request.tasks if task.id == task_info["id"])

      result_tasks.append(OptimizedTask(
        id=task_info["id"],
        title=task_info["title"],
        priority_score=best_solution["objectives"]["total_score"],
        rank=task_info["position"],
        original_task=original_task
      ))

    execution_time = (time.time() - start_time) * 1000  # ミリ秒

    logger.info(f"NSGA-II最適化完了: 実行時間 {execution_time:.2f}ms")

    # 詳細結果が要求された場合は、NSGA-II結果をそのまま返す
    if request.detailed:
      nsga2_result["execution_time_ms"] = round(execution_time, 2)
      # 解の数を制限
      if request.max_solutions > 1 and len(nsga2_result["solutions"]) > request.max_solutions:
        nsga2_result["solutions"] = nsga2_result["solutions"][:request.max_solutions]

      # numpy型をPythonネイティブ型に変換してからJSONResponseで返す
      def convert_numpy_types(obj):
        """numpy型をPythonネイティブ型に変換"""
        if hasattr(obj, 'item'):  # numpy scalar
          return obj.item()
        elif isinstance(obj, dict):
          return {k: convert_numpy_types(v) for k, v in obj.items()}
        elif isinstance(obj, list):
          return [convert_numpy_types(item) for item in obj]
        else:
          return obj

      # numpy型を変換
      converted_result = convert_numpy_types(nsga2_result)

      # JSONResponseを使用してPydanticモデルの制約を回避
      return JSONResponse(content=converted_result)

    # 標準レスポンス
    return OptimizeResponse(
      optimized_tasks=result_tasks,
      total_tasks=len(result_tasks),
      algorithm_used=f"NSGA-II Multi-Objective Optimization (pop_size={nsga2_result['parameters']['population_size']}, gen={nsga2_result['parameters']['generations']})",
      execution_time_ms=round(execution_time, 2)
    )

  except Exception as e:
    logger.error(f"最適化エラー: {str(e)}")
    raise HTTPException(status_code=500, detail=f"最適化処理でエラーが発生しました: {str(e)}")
