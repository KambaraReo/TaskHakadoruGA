import React from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import {
  OptimizationStep,
  OptimizationParams,
} from "../hooks/useOptimizationModal";
import {
  OptimizeResponse,
  DetailedOptimizeResponse,
  SimpleOptimizeResponse,
} from "../lib/api";
import { Task } from "../types/task";

interface OptimizationModalProps {
  isOpen: boolean;
  currentStep: OptimizationStep;
  selectedTasks: Task[];
  params: OptimizationParams;
  optimizationResult: OptimizeResponse | null;
  error: string | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onParamsUpdate: (params: Partial<OptimizationParams>) => void;
  onStartOptimization: () => void;
}

export const OptimizationModal: React.FC<OptimizationModalProps> = ({
  isOpen,
  currentStep,
  selectedTasks,
  params,
  optimizationResult,
  error,
  onClose,
  onNext,
  onPrev,
  onParamsUpdate,
  onStartOptimization,
}) => {
  if (!isOpen) return null;

  const renderStepIndicator = () => (
    <div className="optimization-step-indicator">
      <div className={`step ${currentStep === "confirmation" ? "active" : ""}`}>
        <span className="step-number">1</span>
        <span className="step-label">確認</span>
      </div>
      <div className={`step ${currentStep === "parameters" ? "active" : ""}`}>
        <span className="step-number">2</span>
        <span className="step-label">設定</span>
      </div>
      <div className={`step ${currentStep === "processing" ? "active" : ""}`}>
        <span className="step-number">3</span>
        <span className="step-label">実行</span>
      </div>
      <div className={`step ${currentStep === "results" ? "active" : ""}`}>
        <span className="step-number">4</span>
        <span className="step-label">結果</span>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="optimization-step-content">
      <h3>選択されたタスクを最適化しますか？</h3>
      <div className="selected-tasks-preview">
        <p className="task-count">
          {selectedTasks.length}個のタスクが選択されています。
        </p>
        <div className="task-list-preview scrollable">
          {selectedTasks.map((task) => (
            <div key={task.id} className="task-preview-item">
              <span className="task-title">
                #{task.id} {task.title}
              </span>
              <span className="task-priority">
                重要度: {task.importance}/5, 緊急度: {task.urgency}/5
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderParametersStep = () => (
    <div className="optimization-step-content">
      <h3>最適化重み設定</h3>
      <div className="parameter-form">
        <div className="form-group">
          <label>
            重要度の重み
            <p className="weight-description">
              → タスクの重要度をどの程度重視するか
            </p>
          </label>

          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={params.weights.importance}
            onChange={(e) =>
              onParamsUpdate({
                weights: {
                  ...params.weights,
                  importance: parseFloat(e.target.value),
                },
              })
            }
            className="weight-slider"
          />
          <span className="weight-value">
            {params.weights.importance.toFixed(1)}
          </span>
        </div>

        <div className="form-group">
          <label>
            緊急度の重み
            <p className="weight-description">
              → タスクの緊急度をどの程度重視するか
            </p>
          </label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={params.weights.urgency}
            onChange={(e) =>
              onParamsUpdate({
                weights: {
                  ...params.weights,
                  urgency: parseFloat(e.target.value),
                },
              })
            }
            className="weight-slider"
          />
          <span className="weight-value">
            {params.weights.urgency.toFixed(1)}
          </span>
        </div>

        <div className="form-group">
          <label>
            実行しやすさの重み
            <p className="weight-description">
              → 実行しやすいタスクをどの程度優先するか
            </p>
          </label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={params.weights.ease}
            onChange={(e) =>
              onParamsUpdate({
                weights: {
                  ...params.weights,
                  ease: parseFloat(e.target.value),
                },
              })
            }
            className="weight-slider"
          />
          <span className="weight-value">{params.weights.ease.toFixed(1)}</span>
        </div>

        <div className="form-group">
          <label>
            エネルギー効率の重み
            <p className="weight-description">
              → エネルギー効率をどの程度重視するか
            </p>
          </label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={params.weights.energy}
            onChange={(e) =>
              onParamsUpdate({
                weights: {
                  ...params.weights,
                  energy: parseFloat(e.target.value),
                },
              })
            }
            className="weight-slider"
          />
          <span className="weight-value">
            {params.weights.energy.toFixed(1)}
          </span>
        </div>

        <div className="form-group">
          <label>
            時間効率の重み
            <p className="weight-description">
              → 短時間で完了できるタスクをどの程度優先するか
            </p>
          </label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={params.weights.time}
            onChange={(e) =>
              onParamsUpdate({
                weights: {
                  ...params.weights,
                  time: parseFloat(e.target.value),
                },
              })
            }
            className="weight-slider"
          />
          <span className="weight-value">{params.weights.time.toFixed(1)}</span>
        </div>

        <div className="form-group">
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={params.detailed}
              onChange={(e) => onParamsUpdate({ detailed: e.target.checked })}
            />
            <span>詳細な最適化結果を取得する</span>
          </label>
        </div>

        {params.detailed && (
          <div className="form-group">
            <label>
              取得する解の数
              <p className="weight-description">
                → 複数の最適化案を比較したい場合に設定
              </p>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={params.maxSolutions}
              onChange={(e) =>
                onParamsUpdate({ maxSolutions: parseInt(e.target.value) })
              }
              className="weight-slider"
            />
            <span className="weight-value">{params.maxSolutions}個</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="optimization-step-content">
      <h3>最適化を実行中...</h3>
      <div className="processing-animation">
        <div className="spinner"></div>
        <p>タスクの最適化を計算しています</p>
      </div>
    </div>
  );

  // レスポンスの型を判定するヘルパー関数
  const isDetailedResponse = (
    response: OptimizeResponse
  ): response is DetailedOptimizeResponse => {
    return "solutions" in response;
  };

  const renderResultsStep = () => {
    if (error) {
      return (
        <div className="optimization-step-content">
          <div className="optimization-error">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-red-600">最適化に失敗しました</h3>
            <p className="error-message">{error}</p>
            <p className="error-suggestion">
              パラメータを調整して再度お試しください。
            </p>
          </div>
        </div>
      );
    }

    if (!optimizationResult) {
      return (
        <div className="optimization-step-content">
          <h3>最適化結果を取得中...</h3>
        </div>
      );
    }

    // 詳細な結果の場合
    if (isDetailedResponse(optimizationResult)) {
      return (
        <div className="optimization-step-content">
          <div className="optimization-success">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-green-600">最適化が完了しました</h3>
          </div>

          <div className="optimization-results">
            <div className="results-summary">
              <div className="result-item">
                <span className="label">最適化されたタスク数:</span>
                <span className="value">
                  {optimizationResult.best_solution.task_order.length}個
                </span>
              </div>
              <div className="result-item">
                <span className="label">使用アルゴリズム:</span>
                <span className="value">{optimizationResult.algorithm}</span>
              </div>
              <div className="result-item">
                <span className="label">処理時間:</span>
                <span className="value">
                  {optimizationResult.execution_time_ms.toFixed(1)}ms
                </span>
              </div>
              <div className="result-item">
                <span className="label">生成された解の数:</span>
                <span className="value">
                  {optimizationResult.solutions.length}個
                </span>
              </div>
            </div>

            <div className="optimized-task-list">
              <h4>最適化されたタスク順序（最良解）</h4>
              <div className="solution-info">
                <p>
                  総合スコア:{" "}
                  {optimizationResult.best_solution.objectives.total_score.toFixed(
                    2
                  )}
                </p>
              </div>
              <div className="task-order-list">
                {optimizationResult.best_solution.task_order.map(
                  (taskOrder, index) => (
                    <div key={taskOrder.id} className="optimized-task-item">
                      <div className="task-rank">{index + 1}</div>
                      <div className="task-info">
                        <div className="task-name">{taskOrder.title}</div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 通常の結果の場合
    const simpleResult = optimizationResult as SimpleOptimizeResponse;
    return (
      <div className="optimization-step-content">
        <div className="optimization-success">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-green-600">最適化が完了しました</h3>
        </div>

        <div className="optimization-results">
          <div className="results-summary">
            <div className="result-item">
              <span className="label">最適化されたタスク数:</span>
              <span className="value">{simpleResult.total_tasks}個</span>
            </div>
            <div className="result-item">
              <span className="label">使用アルゴリズム:</span>
              <span className="value">{simpleResult.algorithm_used}</span>
            </div>
            <div className="result-item">
              <span className="label">処理時間:</span>
              <span className="value">
                {simpleResult.execution_time_ms.toFixed(1)}ms
              </span>
            </div>
          </div>

          <div className="optimized-task-list">
            <h4>最適化されたタスク順序</h4>
            <div className="task-order-list">
              {simpleResult.optimized_tasks.map((task, index) => (
                <div key={task.id} className="optimized-task-item">
                  <div className="task-rank">{index + 1}</div>
                  <div className="task-info">
                    <div className="task-name">{task.title}</div>
                    <div className="task-score">
                      優先度スコア: {task.priority_score.toFixed(2)}
                    </div>
                  </div>
                  <div className="task-details">
                    <span className="task-duration">
                      {task.original_task.duration}分
                    </span>
                    <span className="task-importance">
                      重要度: {task.original_task.importance}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "confirmation":
        return renderConfirmationStep();
      case "parameters":
        return renderParametersStep();
      case "processing":
        return renderProcessingStep();
      case "results":
        return renderResultsStep();
      default:
        return null;
    }
  };

  const renderButtons = () => {
    switch (currentStep) {
      case "confirmation":
        return (
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={onClose}>
              キャンセル
            </button>
            <button className="btn-primary" onClick={onNext}>
              次へ
            </button>
          </div>
        );
      case "parameters":
        return (
          <div className="modal-buttons">
            <button className="btn-secondary" onClick={onPrev}>
              戻る
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                onNext();
                onStartOptimization();
              }}
            >
              最適化開始
            </button>
          </div>
        );
      case "processing":
        return null;
      case "results":
        return (
          <div className="modal-buttons">
            <button className="btn-primary" onClick={onClose}>
              完了
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="optimization-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>タスク最適化</h2>
          <button
            onClick={onClose}
            className="modal-close-button"
            aria-label="モーダルを閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderStepIndicator()}

        <div className="modal-body">{renderStepContent()}</div>

        <div className="modal-footer">{renderButtons()}</div>
      </div>
    </div>
  );
};
