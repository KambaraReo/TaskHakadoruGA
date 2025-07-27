"use client";

import { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { taskApi, ApiError } from "@/lib/api";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // クライアントサイドでのみ実行
  useEffect(() => {
    setMounted(true);
  }, []);

  // タスク取得
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedTasks = await taskApi.getTasks();
        setTasks(fetchedTasks);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`API Error: ${err.message}`);
        } else {
          setError(
            err instanceof Error ? err.message : "Unknown error occurred"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchTasks();
    }
  }, [mounted]);

  return {
    tasks,
    loading,
    error,
    mounted,
    refetch: () => {
      if (mounted) {
        const fetchTasks = async () => {
          try {
            setLoading(true);
            setError(null);
            const fetchedTasks = await taskApi.getTasks();
            setTasks(fetchedTasks);
          } catch (err) {
            if (err instanceof ApiError) {
              setError(`API Error: ${err.message}`);
            } else {
              setError(
                err instanceof Error ? err.message : "Unknown error occurred"
              );
            }
          } finally {
            setLoading(false);
          }
        };
        fetchTasks();
      }
    },
  };
};
