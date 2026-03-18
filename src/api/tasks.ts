import client, { ApiResponse, PagedResponse } from './client'
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskType } from '../types/task'

export interface TaskListParams {
  page?: number
  page_size?: number
  status?: TaskStatus
  type?: TaskType
  search?: string
}

export const tasksApi = {
  list: async (params: TaskListParams = {}): Promise<PagedResponse<Task[]>> => {
    const response = await client.get('/tasks', { params })
    return response.data
  },

  get: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await client.get(`/tasks/${id}`)
    return response.data
  },

  create: async (data: CreateTaskRequest): Promise<ApiResponse<Task>> => {
    const response = await client.post('/tasks', data)
    return response.data
  },

  update: async (id: string, data: UpdateTaskRequest): Promise<ApiResponse<Task>> => {
    const response = await client.put(`/tasks/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/tasks/${id}`)
  },

  start: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await client.post(`/tasks/${id}/start`)
    return response.data
  },

  pause: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await client.post(`/tasks/${id}/pause`)
    return response.data
  },

  stop: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await client.post(`/tasks/${id}/stop`)
    return response.data
  },
}
