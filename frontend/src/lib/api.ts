import { Task } from "@/types/task";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `HTTP error! status: ${response.status}`
      );
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
