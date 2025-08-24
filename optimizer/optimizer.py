import json
import numpy as np
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.core.problem import ElementwiseProblem
from pymoo.optimize import minimize
import logging

logger = logging.getLogger(__name__)

class TaskSchedulingProblem(ElementwiseProblem):
  """
  多目的タスクスケジューリング問題

  目的関数:
  1. 優先度の最大化（重要度・緊急度・容易さを考慮）
  2. 効率性の最大化（エネルギー効率・時間効率）
  3. 制約違反の最小化（依存関係・締切制約）

  注意: この問題は順列最適化問題として扱う
  """

  def __init__(self, tasks: List[Dict[str, Any]], weights: Dict[str, float] = None):
    self.tasks = tasks
    self.n_tasks = len(tasks)

    # 重み設定
    self.weights = weights or {
      "importance": 3.0,
      "urgency": 2.0,
      "ease": 1.0,
      "energy": 2.0,
      "time": 1.5
    }

    # タスクIDとインデックスのマッピング
    self.task_id_to_index = {task['id']: i for i, task in enumerate(tasks)}

    super().__init__(
      n_var=self.n_tasks,  # 変数数：タスクの順序
      n_obj=3,              # 目的関数数：優先度、効率性、制約違反
      n_constr=0,           # 制約は目的関数として扱う
      xl=0.0,               # 下限：0.0（連続値として扱う）
      xu=1.0,               # 上限：1.0（連続値として扱う）
      type_var=float        # 連続変数（後で順列に変換）
    )

  def _evaluate(self, x, out, *args, **kwargs):
    """
    解の評価関数

    Args:
      x: 連続値配列（0-1の範囲）
      out: 出力辞書
    """
    # 連続値を順列に変換（ランキングベース）
    indices = np.argsort(x)  # xの値でソートしたインデックスを取得

    # 実行順序に従ってタスクを並べる
    ordered_tasks = [self.tasks[i] for i in indices]

    # 目的関数の計算
    f1 = self._calculate_priority_objective(ordered_tasks)
    f2 = self._calculate_efficiency_objective(ordered_tasks)
    f3 = self._calculate_constraint_violation(ordered_tasks, indices)

    # NSGA-IIは最小化問題なので、最大化したい目的は負の値にする
    out["F"] = [-f1, -f2, f3]  # 優先度と効率性は最大化、制約違反は最小化

  def _calculate_priority_objective(self, ordered_tasks: List[Dict]) -> float:
    """
    優先度目的関数の計算

    重要度・緊急度・容易さを考慮した優先度スコア
    後に実行されるタスクほどペナルティが大きくなる
    """
    total_score = 0.0

    for position, task in enumerate(ordered_tasks):
      # 基本優先度スコア（ユーザー設定の重みを使用）
      priority_score = (
        task['importance'] * self.weights.get('importance', 3.0) +
        task['urgency'] * self.weights.get('urgency', 2.0) +
        (6 - task['ease']) * self.weights.get('ease', 1.0)
      )

      # 位置によるペナルティ（後ろほど大きなペナルティ）
      position_penalty = 1.0 / (position + 1)

      total_score += priority_score * position_penalty

    return total_score

  def _calculate_efficiency_objective(self, ordered_tasks: List[Dict]) -> float:
    """
    効率性目的関数の計算

    エネルギー効率と時間効率を考慮
    """
    total_efficiency = 0.0

    for position, task in enumerate(ordered_tasks):
      # エネルギー効率（必要エネルギーが少ないほど良い）
      energy_efficiency = (11 - task['energy_required']) / 10.0

      # 時間効率（短時間で完了できるタスクを優先）
      time_efficiency = 1.0 / (task['duration'] / 60.0 + 1)  # 時間単位に変換

      # 容易さによる効率性（簡単なタスクは効率的）
      ease_efficiency = task['ease'] / 5.0

      efficiency_score = (
        energy_efficiency * self.weights.get('energy', 2.0) +
        time_efficiency * self.weights.get('time', 1.5) +
        ease_efficiency * self.weights.get('ease', 1.0)
      )

      # 位置による重み付け
      position_weight = 1.0 / (position + 1)

      total_efficiency += efficiency_score * position_weight

    return total_efficiency

  def _calculate_constraint_violation(self, ordered_tasks: List[Dict], order_array: np.ndarray) -> float:
    """
    制約違反の計算

    依存関係制約と締切制約の違反度を計算
    """
    violation_score = 0.0

    # 依存関係制約の確認
    task_positions = {task['id']: position for position, task in enumerate(ordered_tasks)}

    for position, task in enumerate(ordered_tasks):
      if task['dependencies']:
        for dep_id in task['dependencies']:
          if dep_id in task_positions:
            dep_position = task_positions[dep_id]
            if dep_position > position:
              # 依存タスクが後に実行される場合は制約違反
              violation_score += 10.0

    # 締切制約の確認
    current_time = datetime.now()  # 現在時刻から開始
    for task in ordered_tasks:
      # タスクの実行時間を加算
      current_time += timedelta(minutes=task['duration'])

      if task['deadline']:
        try:
          # 締切時間の解析（ISO形式の日時文字列を想定）
          if isinstance(task['deadline'], str):
            # ISO形式の日時文字列をパース
            deadline = datetime.fromisoformat(task['deadline'].replace('Z', '+00:00'))
          else:
            # 既にdatetimeオブジェクトの場合
            deadline = task['deadline']

          # タイムゾーンを考慮した比較
          if current_time.tzinfo is None:
            current_time = current_time.replace(tzinfo=timezone.utc)
          if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=timezone.utc)

          # 締切を過ぎている場合は制約違反
          if current_time > deadline:
            # 遅延時間に応じて違反スコアを計算（時間単位）
            delay_hours = (current_time - deadline).total_seconds() / 3600
            violation_score += min(delay_hours * 2.0, 20.0)  # 最大20点の違反
        except Exception as e:
          # 日時解析エラーの場合は軽微な違反として扱う
          logger.warning(f"締切解析エラー: {task['deadline']} - {str(e)}")
          violation_score += 1.0

    return violation_score

def run_nsga2_optimization(tasks: List[Dict[str, Any]],
                          pop_size: int = 50,
                          n_gen: int = 100,
                          weights: Dict[str, float] = None) -> Dict[str, Any]:
  """
  NSGA-II多目的最適化の実行

  Args:
    tasks: タスクリスト
    pop_size: 集団サイズ
    n_gen: 世代数
    weights: 目的関数の重み設定

  Returns:
    最適化結果
  """
  # デフォルト重み設定
  if weights is None:
    weights = {
      "importance": 3.0,
      "urgency": 2.0,
      "ease": 1.0,
      "energy": 2.0,
      "time": 1.5
    }

  logger.info(f"NSGA-II最適化開始: {len(tasks)}タスク, 集団サイズ{pop_size}, 世代数{n_gen}")
  logger.info(f"重み設定: {weights}")

  # 最適化問題の定義
  problem = TaskSchedulingProblem(tasks, weights)

  # NSGA-IIアルゴリズムの設定
  # デフォルトの設定を使用
  # - crossover: SimulatedBinaryCrossover (SBX) with prob=0.9, eta=15
  # - mutation: PolynomialMutation with prob=1/n_var, eta=20
  # - selection: TournamentSelection with pressure=2
  algorithm = NSGA2(pop_size=pop_size)

  # カスタマイズする場合
  # from pymoo.operators.crossover.sbx import SBX
  # from pymoo.operators.mutation.pm import PM
  # from pymoo.operators.selection.tournament import TournamentSelection
  #
  # algorithm = NSGA2(
  #   pop_size=pop_size,
  #   crossover=SBX(prob=0.8, eta=18),
  #   mutation=PM(prob=1.0/problem.n_var, eta=15),
  #   selection=TournamentSelection(pressure=4)
  # )

  # 最適化実行
  result = minimize(
    problem,
    algorithm,
    ('n_gen', n_gen),
    seed=42,
    verbose=False
  )

  # 結果の処理
  solutions = []

  try:
    for i, individual in enumerate(result.pop):
      # 連続値を順列に変換
      order_indices = np.argsort(individual.X)
      ordered_tasks = [tasks[idx] for idx in order_indices]

      # 目的関数値（元の値に戻す）
      objectives = individual.F
      priority_score = -objectives[0] if len(objectives) > 0 else 0.0
      efficiency_score = -objectives[1] if len(objectives) > 1 else 0.0
      constraint_violation = objectives[2] if len(objectives) > 2 else 0.0

      solution = {
        "solution_id": i + 1,
        "task_order": [
          {
            "id": task["id"],
            "title": task["title"],
            "position": pos + 1
          }
          for pos, task in enumerate(ordered_tasks)
        ],
        "objectives": {
          "priority_score": float(round(float(priority_score), 3)),
          "efficiency_score": float(round(float(efficiency_score), 3)),
          "constraint_violation": float(round(float(constraint_violation), 3)),
          "total_score": float(round(float(priority_score + efficiency_score - constraint_violation), 3))
        },
        "metrics": {
          "total_duration": sum(task["duration"] for task in ordered_tasks),
          "total_energy": sum(task["energy_required"] for task in ordered_tasks),
          "avg_importance": round(sum(task["importance"] for task in ordered_tasks) / len(ordered_tasks), 2),
          "avg_urgency": round(sum(task["urgency"] for task in ordered_tasks) / len(ordered_tasks), 2)
        }
      }

      solutions.append(solution)
  except Exception as e:
    logger.error(f"結果処理エラー: {str(e)}")

    # フォールバック: 優先度スコアでタスクを並べ替える
    sorted_tasks = sorted(tasks, key=lambda x: (
        x['importance'] * weights.get('importance', 3.0) +
        x['urgency'] * weights.get('urgency', 2.0) +
        (6 - x['ease']) * weights.get('ease', 1.0)
    ), reverse=True)

    # 優先度スコアの合計（目的関数用）
    total_priority_score = sum(
        task['importance'] * weights.get('importance', 3.0) +
        task['urgency'] * weights.get('urgency', 2.0) +
        (6 - task['ease']) * weights.get('ease', 1.0)
        for task in sorted_tasks
    )

    # 結果を1件のソリューションとしてまとめる
    solutions = [{
        "solution_id": 1,
        "task_order": [
            {
                "id": task["id"],
                "title": task["title"],
                "position": pos + 1
            }
            for pos, task in enumerate(sorted_tasks)
        ],
        "objectives": {
            "priority_score": round(total_priority_score, 3),
            "efficiency_score": 0.0,                           # fallback では評価しない
            "constraint_violation": 0.0,                       # fallback では考慮しない
            "total_score": round(total_priority_score, 3)      # 同じ値を再利用
        },
        "metrics": {
            "total_duration": sum(task["duration"] for task in sorted_tasks),
            "total_energy": sum(task["energy_required"] for task in sorted_tasks),
            "avg_importance": round(sum(task["importance"] for task in sorted_tasks) / len(sorted_tasks), 2),
            "avg_urgency": round(sum(task["urgency"] for task in sorted_tasks) / len(sorted_tasks), 2)
        }
    }]

  # 総合スコア順でソート
  solutions.sort(key=lambda x: x["objectives"]["total_score"], reverse=True)

  logger.info(f"NSGA-II最適化完了: {len(solutions)}個の解を生成")

  return {
    "algorithm": "NSGA-II",
    "parameters": {
      "population_size": pop_size,
      "generations": n_gen,
      "objectives": ["priority", "efficiency", "constraint_violation"]
    },
    "solutions": solutions[:10],  # 上位10解を返す
    "total_solutions": len(solutions),
    "best_solution": solutions[0] if solutions else None
  }

if __name__ == "__main__":
  import sys
  input_data = json.load(sys.stdin)
  tasks = input_data["tasks"]

  # 重み設定（デフォルト値）
  weights = input_data.get("weights", {
    "importance": 3.0,
    "urgency": 2.0,
    "ease": 1.0,
    "energy": 2.0,
    "time": 1.5
  })

  result = run_nsga2_optimization(tasks, weights=weights)
  print(json.dumps(result))
