export type TaskType = 'keyword_search' | 'channel_monitor' | 'playlist'
export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed'

export interface Task {
  id: string
  name: string
  type: TaskType
  status: TaskStatus
  config: TaskConfig
  progress: number
  total_found: number
  total_analyzed: number
  total_confirmed: number
  error_message?: string
  created_at: string
  updated_at: string
  started_at?: string
  completed_at?: string
  keywords?: string[]
  channels?: string[]
}

export interface TaskConfig {
  keywords?: string[]
  channel_ids?: string[]
  playlist_id?: string
  max_results?: number
  date_after?: string
  date_before?: string
  min_duration?: number
  max_duration?: number
  language?: string
}

export interface CreateTaskRequest {
  name: string
  type: TaskType
  config: TaskConfig
}

export interface UpdateTaskRequest {
  name?: string
  config?: TaskConfig
}
