#!/usr/bin/env python3
"""
FastAPI最適化エンドポイントのテストスクリプト
"""

import requests
import json
import sys
from typing import Dict, Any

def test_health_check(base_url: str = "http://localhost:8000") -> bool:
  """ヘルスチェックエンドポイントのテスト"""
  try:
    response = requests.get(f"{base_url}/")
    print(f"Health Check: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200
  except Exception as e:
    print(f"Health check failed: {e}")
    return False

def test_optimize_endpoint(base_url: str = "http://localhost:8000", test_file: str = "test_optimize.json") -> bool:
  """最適化エンドポイントのテスト"""
  try:
    # テストデータの読み込み
    with open(test_file, 'r', encoding='utf-8') as f:
      test_data = json.load(f)

    # 最適化エンドポイントの呼び出し
    response = requests.post(
      f"{base_url}/optimize",
      json=test_data,
      headers={"Content-Type": "application/json"}
    )

    print(f"Optimize Endpoint: {response.status_code}")

    if response.status_code == 200:
      result = response.json()
      print(f"Total tasks: {result['total_tasks']}")
      print(f"Algorithm: {result['algorithm_used']}")
      print(f"Execution time: {result['execution_time_ms']}ms")
      print("\nOptimized order:")

      for task in result['optimized_tasks']:
        print(f"  {task['rank']}. {task['title']} (Score: {task['priority_score']})")

      return True
    else:
      print(f"Error: {response.text}")
      return False

  except Exception as e:
    print(f"Optimize test failed: {e}")
    return False

def test_weights_endpoint(base_url: str = "http://localhost:8000", test_file: str = "test_optimize_weights.json") -> bool:
  """重み設定付き最適化エンドポイントのテスト"""
  try:
    # テストデータの読み込み
    with open(test_file, 'r', encoding='utf-8') as f:
      test_data = json.load(f)

    # 重み設定付き最適化エンドポイントの呼び出し
    response = requests.post(
      f"{base_url}/optimize",
      json=test_data,
      headers={"Content-Type": "application/json"}
    )

    print(f"Weights Optimization Endpoint: {response.status_code}")

    if response.status_code == 200:
      result = response.json()
      print(f"Total tasks: {result['total_tasks']}")
      print(f"Algorithm: {result['algorithm_used']}")
      print(f"Execution time: {result['execution_time_ms']}ms")
      print("\nOptimized order with custom weights:")

      for task in result['optimized_tasks']:
        print(f"  {task['rank']}. {task['title']} (Score: {task['priority_score']})")

      return True
    else:
      print(f"Error: {response.text}")
      return False

  except Exception as e:
    print(f"Weights test failed: {e}")
    return False

def test_detailed_endpoint(base_url: str = "http://localhost:8000", test_file: str = "test_optimize.json") -> bool:
  """詳細最適化エンドポイントのテスト"""
  try:
    # テストデータの読み込み
    with open(test_file, 'r', encoding='utf-8') as f:
      test_data = json.load(f)

    # 詳細結果を要求
    test_data["detailed"] = True
    test_data["max_solutions"] = 5

    # 詳細最適化エンドポイントの呼び出し
    response = requests.post(
      f"{base_url}/optimize",
      json=test_data,
      headers={"Content-Type": "application/json"}
    )

    print(f"Detailed Optimization Endpoint: {response.status_code}")

    if response.status_code == 200:
      result = response.json()
      print(f"Algorithm: {result['algorithm']}")
      print(f"Parameters: {result['parameters']}")
      print(f"Total solutions: {result['total_solutions']}")
      print(f"Execution time: {result['execution_time_ms']}ms")

      if result['best_solution']:
        best = result['best_solution']
        print(f"\nBest solution (ID: {best['solution_id']}):")
        print(f"  Total score: {best['objectives']['total_score']}")
        print(f"  Priority: {best['objectives']['priority_score']}")
        print(f"  Efficiency: {best['objectives']['efficiency_score']}")
        print(f"  Constraint violation: {best['objectives']['constraint_violation']}")
        print(f"  Task order:")

        for task in best['task_order']:
          print(f"    {task['position']}. {task['title']}")

      return True
    else:
      print(f"Error: {response.text}")
      return False

  except Exception as e:
    print(f"Detailed test failed: {e}")
    return False

def main():
  """メイン関数"""
  base_url = "http://localhost:8000"

  if len(sys.argv) > 1:
    base_url = sys.argv[1]

  print("=== FastAPI Optimizer Test ===")
  print(f"Base URL: {base_url}")
  print()

  # ヘルスチェック
  print("1. Health Check Test")
  health_ok = test_health_check(base_url)
  print()

  if not health_ok:
    print("Health check failed. Exiting.")
    sys.exit(1)

  # 最適化エンドポイントテスト
  print("2. Optimize Endpoint Test")
  optimize_ok = test_optimize_endpoint(base_url)
  print()

  # 重み設定付き最適化テスト
  print("3. Custom Weights Optimization Test")
  weights_ok = test_weights_endpoint(base_url)
  print()

  # 詳細最適化エンドポイントテスト
  print("4. Detailed Optimization Test")
  detailed_ok = test_detailed_endpoint(base_url)
  print()

  if optimize_ok and weights_ok and detailed_ok:
    print("✅ All tests passed!")
  else:
    print("❌ Some tests failed!")
    sys.exit(1)

if __name__ == "__main__":
  main()
