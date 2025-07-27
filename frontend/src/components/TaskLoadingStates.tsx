import { Loader2, AlertCircle } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({
  message = "タスクを読み込み中...",
}: LoadingStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
};

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold text-red-600">
            エラーが発生しました
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
        <button
          onClick={onRetry || (() => window.location.reload())}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          再読み込み
        </button>
      </div>
    </div>
  );
};
