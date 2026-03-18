import { useState, useCallback } from 'react'
import { message } from 'antd'
import { tasksApi, TaskListParams } from '../api/tasks'
import { useAppStore } from '../store'
import { CreateTaskRequest, Task } from '../types/task'

export function useTasks() {
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const { tasks, setTasks, setCurrentTask, removeTask } = useAppStore()

  const fetchTasks = useCallback(async (params: TaskListParams = {}) => {
    setLoading(true)
    try {
      const response = await tasksApi.list({
        page: params.page || pagination.page,
        page_size: params.page_size || pagination.pageSize,
        ...params,
      })
      setTasks(response.data || [])
      setPagination({
        page: response.meta.page,
        pageSize: response.meta.page_size,
        total: response.meta.total,
      })
    } catch (error) {
      message.error('Failed to fetch tasks')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, setTasks])

  const fetchTask = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await tasksApi.get(id)
      setCurrentTask(response.data || null)
      return response.data
    } catch (error) {
      message.error('Failed to fetch task')
      console.error(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [setCurrentTask])

  const createTask = useCallback(async (data: CreateTaskRequest): Promise<Task | null> => {
    setLoading(true)
    try {
      const response = await tasksApi.create(data)
      message.success('Task created successfully')
      await fetchTasks()
      return response.data || null
    } catch (error) {
      message.error('Failed to create task')
      console.error(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchTasks])

  const deleteTask = useCallback(async (id: string) => {
    try {
      await tasksApi.delete(id)
      removeTask(id)
      message.success('Task deleted successfully')
    } catch (error) {
      message.error('Failed to delete task')
      console.error(error)
    }
  }, [removeTask])

  const startTask = useCallback(async (id: string) => {
    try {
      await tasksApi.start(id)
      message.success('Task started')
      await fetchTask(id)
    } catch (error) {
      message.error('Failed to start task')
      console.error(error)
    }
  }, [fetchTask])

  const pauseTask = useCallback(async (id: string) => {
    try {
      await tasksApi.pause(id)
      message.success('Task paused')
      await fetchTask(id)
    } catch (error) {
      message.error('Failed to pause task')
      console.error(error)
    }
  }, [fetchTask])

  const stopTask = useCallback(async (id: string) => {
    try {
      await tasksApi.stop(id)
      message.success('Task stopped')
      await fetchTask(id)
    } catch (error) {
      message.error('Failed to stop task')
      console.error(error)
    }
  }, [fetchTask])

  return {
    tasks,
    loading,
    pagination,
    fetchTasks,
    fetchTask,
    createTask,
    deleteTask,
    startTask,
    pauseTask,
    stopTask,
  }
}
