import client, { ApiResponse, PagedResponse } from './client'
import { Video, VideoTag, DialogueSegment, CreateTagRequest, AnalysisStatus } from '../types/video'

export interface VideoListParams {
  page?: number
  page_size?: number
  task_id?: string
  is_dialogue?: boolean
  analysis_status?: AnalysisStatus
  reviewed?: boolean
  tags?: string[]
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export const videosApi = {
  list: async (params: VideoListParams = {}): Promise<PagedResponse<Video[]>> => {
    const response = await client.get('/videos', { params })
    return response.data
  },

  get: async (id: string): Promise<ApiResponse<Video>> => {
    const response = await client.get(`/videos/${id}`)
    return response.data
  },

  getSegments: async (id: string): Promise<ApiResponse<DialogueSegment[]>> => {
    const response = await client.get(`/videos/${id}/segments`)
    return response.data
  },

  getTags: async (id: string): Promise<ApiResponse<VideoTag[]>> => {
    const response = await client.get(`/videos/${id}/tags`)
    return response.data
  },

  review: async (id: string, result: boolean): Promise<ApiResponse<Video>> => {
    const response = await client.put(`/videos/${id}/review`, { result })
    return response.data
  },

  addTag: async (id: string, data: CreateTagRequest): Promise<ApiResponse<VideoTag>> => {
    const response = await client.post(`/videos/${id}/tags`, data)
    return response.data
  },

  deleteTag: async (videoId: string, tagId: string): Promise<void> => {
    await client.delete(`/videos/${videoId}/tags/${tagId}`)
  },

  export: async (params: { format: 'csv' | 'json'; task_id?: string; is_dialogue?: boolean; tags?: string[] }): Promise<Blob> => {
    const response = await client.post('/videos/export', params, {
      responseType: 'blob',
    })
    return response.data
  },
}

export interface OverviewStats {
  total_tasks: number
  running_tasks: number
  completed_tasks: number
  total_videos: number
  dialogue_videos: number
  analyzed_videos: number
  pending_analysis: number
  reviewed_videos: number
}

export interface TagStats {
  tag_name: string
  tag_type: string
  count: number
}

export const statsApi = {
  overview: async (): Promise<ApiResponse<OverviewStats>> => {
    const response = await client.get('/stats/overview')
    return response.data
  },

  taskStats: async (taskId: string): Promise<ApiResponse<unknown>> => {
    const response = await client.get(`/stats/tasks/${taskId}`)
    return response.data
  },

  timeline: async (): Promise<ApiResponse<unknown>> => {
    const response = await client.get('/stats/timeline')
    return response.data
  },

  tags: async (): Promise<ApiResponse<TagStats[]>> => {
    const response = await client.get('/stats/tags')
    return response.data
  },
}
