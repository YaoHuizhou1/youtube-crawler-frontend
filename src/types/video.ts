export type AnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed'
export type TagType = 'topic' | 'format' | 'guest' | 'custom'
export type TagSource = 'auto' | 'manual' | 'llm'

export interface Video {
  id: string
  youtube_id: string
  task_id?: string
  title: string
  description?: string
  channel_id?: string
  channel_name?: string
  duration_seconds?: number
  view_count?: number
  like_count?: number
  comment_count?: number
  published_at?: string
  thumbnail_url?: string
  is_dialogue?: boolean
  dialogue_confidence?: number
  face_count_avg?: number
  speaker_count?: number
  analysis_status: AnalysisStatus
  analysis_error?: string
  reviewed: boolean
  review_result?: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
  tags?: VideoTag[]
  segments?: DialogueSegment[]
}

export interface VideoTag {
  id: string
  video_id: string
  tag_name: string
  tag_type: TagType
  confidence?: number
  source: TagSource
  created_at: string
}

export interface DialogueSegment {
  id: string
  video_id: string
  start_time_ms: number
  end_time_ms: number
  speaker_count?: number
  confidence?: number
  transcript?: string
  summary?: string
  created_at: string
}

export interface CreateTagRequest {
  tag_name: string
  tag_type: TagType
  confidence?: number
}
