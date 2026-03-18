import { create } from 'zustand'
import { Task } from '../types/task'
import { Video } from '../types/video'
import { OverviewStats } from '../api/videos'

interface AppState {
  // Tasks
  tasks: Task[]
  currentTask: Task | null
  setTasks: (tasks: Task[]) => void
  setCurrentTask: (task: Task | null) => void
  updateTask: (task: Task) => void
  removeTask: (id: string) => void

  // Videos
  videos: Video[]
  currentVideo: Video | null
  setVideos: (videos: Video[]) => void
  setCurrentVideo: (video: Video | null) => void
  updateVideo: (video: Video) => void

  // Stats
  stats: OverviewStats | null
  setStats: (stats: OverviewStats | null) => void

  // WebSocket
  wsConnected: boolean
  setWsConnected: (connected: boolean) => void
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  clearNotifications: () => void
}

interface Notification {
  id: string
  type: string
  message: string
  timestamp: Date
}

export const useAppStore = create<AppState>((set) => ({
  // Tasks
  tasks: [],
  currentTask: null,
  setTasks: (tasks) => set({ tasks }),
  setCurrentTask: (currentTask) => set({ currentTask }),
  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
      currentTask: state.currentTask?.id === task.id ? task : state.currentTask,
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      currentTask: state.currentTask?.id === id ? null : state.currentTask,
    })),

  // Videos
  videos: [],
  currentVideo: null,
  setVideos: (videos) => set({ videos }),
  setCurrentVideo: (currentVideo) => set({ currentVideo }),
  updateVideo: (video) =>
    set((state) => ({
      videos: state.videos.map((v) => (v.id === video.id ? video : v)),
      currentVideo: state.currentVideo?.id === video.id ? video : state.currentVideo,
    })),

  // Stats
  stats: null,
  setStats: (stats) => set({ stats }),

  // WebSocket
  wsConnected: false,
  setWsConnected: (wsConnected) => set({ wsConnected }),
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 100),
    })),
  clearNotifications: () => set({ notifications: [] }),
}))
