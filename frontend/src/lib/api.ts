import { Task } from "@/types/task";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  MeResponse,
  User,
} from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// トークン管理
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }
};

export const getAuthToken = (): string | null => {
  if (authToken) return authToken;

  if (typeof window !== "undefined") {
    authToken = localStorage.getItem("auth_token");
  }

  return authToken;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // エラーレスポンスの内容を取得
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        // バックエンドからのバリデーションエラーを処理
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors[0]; // 最初のエラーメッセージを使用
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // JSONパースに失敗した場合はデフォルトメッセージを使用
      }

      throw new ApiError(response.status, errorMessage);
    }

    const contentLength = response.headers.get("content-length");
    if (response.status === 204 || contentLength === "0") {
      return null as T;
    }

    const text = await response.text();
    if (!text) {
      return null as T;
    }

    return JSON.parse(text);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// 認証API
export const authApi = {
  // ログイン
  login: (credentials: LoginRequest): Promise<AuthResponse> =>
    fetchApi<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  // 登録
  register: (userData: RegisterRequest): Promise<AuthResponse> =>
    fetchApi<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  // 現在のユーザー情報取得
  me: (): Promise<User> =>
    fetchApi<MeResponse>("/auth/me").then((response) => response.user),
};

export const taskApi = {
  // タスク一覧取得
  getTasks: (): Promise<Task[]> => fetchApi<Task[]>("/api/v1/tasks"),

  // タスク詳細取得
  getTask: (id: number): Promise<Task> => fetchApi<Task>(`/api/v1/tasks/${id}`),

  // タスク作成
  createTask: (
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ): Promise<Task> =>
    fetchApi<Task>("/api/v1/tasks", {
      method: "POST",
      body: JSON.stringify({ task }),
    }),

  // タスク更新
  updateTask: (id: number, task: Partial<Task>): Promise<Task> =>
    fetchApi<Task>(`/api/v1/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify({ task }),
    }),

  // タスク削除
  deleteTask: (id: number): Promise<void> =>
    fetchApi<void>(`/api/v1/tasks/${id}`, {
      method: "DELETE",
    }),
};

// 最適化API
export interface OptimizationWeights {
  importance: number;
  urgency: number;
  ease: number;
  energy: number;
  time: number;
}

export interface OptimizeRequest {
  tasks: Task[];
  weights?: OptimizationWeights;
  detailed?: boolean;
  maxSolutions?: number;
}

export interface OptimizedTask {
  id: number;
  title: string;
  priority_score: number;
  rank: number;
  original_task: Task;
}

// 詳細な最適化結果の型定義
export interface TaskOrder {
  id: string | number;
  title: string;
  position: number;
}

export interface Solution {
  solution_id: number;
  task_order: TaskOrder[];
  objectives: {
    priority_score: number;
    efficiency_score: number;
    constraint_violation: number;
    total_score: number;
  };
  metrics: {
    total_duration: number;
    total_energy: number;
    avg_importance: number;
    avg_urgency: number;
  };
}

export interface DetailedOptimizeResponse {
  algorithm: string;
  parameters: {
    population_size: number;
    generations: number;
    objectives: string[];
  };
  solutions: Solution[];
  total_solutions: number;
  best_solution: Solution;
  execution_time_ms: number;
}

// 通常の最適化結果
export interface SimpleOptimizeResponse {
  optimized_tasks: OptimizedTask[];
  total_tasks: number;
  algorithm_used: string;
  execution_time_ms: number;
}

export type OptimizeResponse =
  | SimpleOptimizeResponse
  | DetailedOptimizeResponse;

const OPTIMIZER_BASE_URL =
  process.env.NEXT_PUBLIC_OPTIMIZER_URL || "http://localhost:8000";

export const optimizerApi = {
  // タスク最適化
  optimizeTasks: (request: OptimizeRequest): Promise<OptimizeResponse> =>
    fetch(`${OPTIMIZER_BASE_URL}/optimize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Optimization failed: ${response.status}`);
      }
      return response.json();
    }),
};
