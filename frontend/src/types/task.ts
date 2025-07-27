export interface Task {
  id: number
  title: string
  description?: string
  deadline?: string
  duration: number // 分単位
  energy_required: number // 1-10
  importance: number // 1-5
  urgency: number // 1-5
  ease: number // 1-5
  status: 'todo' | 'in_progress' | 'done'
  dependencies: number[]
  created_at: string
  updated_at: string
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
}
