import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  Row,
  Col,
  Image,
  Timeline,
  Popconfirm,
  Form,
  Input,
  Select,
  Modal,
  message,
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  DeleteOutlined,
  YoutubeOutlined,
} from '@ant-design/icons'
import { videosApi } from '../api/videos'
import { Video, VideoTag, DialogueSegment, CreateTagRequest } from '../types/video'
import dayjs from 'dayjs'

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [video, setVideo] = useState<Video | null>(null)
  const [tagModalOpen, setTagModalOpen] = useState(false)
  const [form] = Form.useForm()

  const fetchVideo = async () => {
    if (!id) return
    setLoading(true)
    try {
      const response = await videosApi.get(id)
      setVideo(response.data || null)
    } catch (error) {
      console.error('Failed to fetch video:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideo()
  }, [id])

  const handleReview = async (result: boolean) => {
    if (!id) return
    try {
      await videosApi.review(id, result)
      message.success(result ? 'Marked as dialogue' : 'Marked as not dialogue')
      fetchVideo()
    } catch (error) {
      message.error('Failed to update review')
    }
  }

  const handleAddTag = async (values: CreateTagRequest) => {
    if (!id) return
    try {
      await videosApi.addTag(id, values)
      message.success('Tag added')
      setTagModalOpen(false)
      form.resetFields()
      fetchVideo()
    } catch (error) {
      message.error('Failed to add tag')
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!id) return
    try {
      await videosApi.deleteTag(id, tagId)
      message.success('Tag deleted')
      fetchVideo()
    } catch (error) {
      message.error('Failed to delete tag')
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (loading || !video) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  const tagTypeColors: Record<string, string> = {
    topic: 'blue',
    format: 'green',
    guest: 'purple',
    custom: 'default',
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/videos')}
        style={{ marginBottom: 16 }}
      >
        Back to Videos
      </Button>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={video.title}
            extra={
              <Button
                type="link"
                icon={<YoutubeOutlined />}
                href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                target="_blank"
              >
                Watch on YouTube
              </Button>
            }
          >
            {video.thumbnail_url && (
              <Image
                src={video.thumbnail_url}
                style={{ marginBottom: 16, maxWidth: '100%' }}
              />
            )}

            <Descriptions column={2}>
              <Descriptions.Item label="Channel">
                {video.channel_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {formatDuration(video.duration_seconds)}
              </Descriptions.Item>
              <Descriptions.Item label="Views">
                {video.view_count?.toLocaleString() || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Likes">
                {video.like_count?.toLocaleString() || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Published">
                {video.published_at ? dayjs(video.published_at).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Analysis Status">
                <Tag color={
                  video.analysis_status === 'completed' ? 'success' :
                  video.analysis_status === 'failed' ? 'error' :
                  video.analysis_status === 'analyzing' ? 'processing' : 'default'
                }>
                  {video.analysis_status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Dialogue">
                {video.is_dialogue !== undefined ? (
                  video.is_dialogue ? (
                    <Tag color="success">Yes</Tag>
                  ) : (
                    <Tag color="error">No</Tag>
                  )
                ) : (
                  <Tag>Unknown</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Confidence">
                {video.dialogue_confidence !== undefined
                  ? `${(video.dialogue_confidence * 100).toFixed(1)}%`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Face Count (Avg)">
                {video.face_count_avg?.toFixed(1) || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Speaker Count">
                {video.speaker_count || '-'}
              </Descriptions.Item>
            </Descriptions>

            {video.description && (
              <div style={{ marginTop: 16 }}>
                <h4>Description</h4>
                <p style={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>
                  {video.description}
                </p>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="Review"
            style={{ marginBottom: 16 }}
          >
            {video.reviewed ? (
              <div>
                <p>
                  Review Result:{' '}
                  <Tag color={video.review_result ? 'success' : 'error'}>
                    {video.review_result ? 'Confirmed Dialogue' : 'Not Dialogue'}
                  </Tag>
                </p>
                <Button onClick={() => handleReview(!video.review_result)}>
                  Change to {video.review_result ? 'Not Dialogue' : 'Dialogue'}
                </Button>
              </div>
            ) : (
              <Space>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleReview(true)}
                >
                  Confirm Dialogue
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleReview(false)}
                >
                  Not Dialogue
                </Button>
              </Space>
            )}
          </Card>

          <Card
            title="Tags"
            extra={
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setTagModalOpen(true)}
              >
                Add Tag
              </Button>
            }
          >
            {video.tags && video.tags.length > 0 ? (
              <Space wrap>
                {video.tags.map((tag: VideoTag) => (
                  <Tag
                    key={tag.id}
                    color={tagTypeColors[tag.tag_type]}
                    closable
                    onClose={(e) => {
                      e.preventDefault()
                      handleDeleteTag(tag.id)
                    }}
                  >
                    {tag.tag_name}
                  </Tag>
                ))}
              </Space>
            ) : (
              <p style={{ color: '#999' }}>No tags</p>
            )}
          </Card>

          {video.segments && video.segments.length > 0 && (
            <Card title="Dialogue Segments" style={{ marginTop: 16 }}>
              <Timeline
                items={video.segments.map((seg: DialogueSegment) => ({
                  children: (
                    <div>
                      <strong>
                        {formatTime(seg.start_time_ms)} - {formatTime(seg.end_time_ms)}
                      </strong>
                      {seg.speaker_count && (
                        <Tag style={{ marginLeft: 8 }}>{seg.speaker_count} speakers</Tag>
                      )}
                      {seg.summary && (
                        <p style={{ marginTop: 4, color: '#666' }}>{seg.summary}</p>
                      )}
                    </div>
                  ),
                }))}
              />
            </Card>
          )}
        </Col>
      </Row>

      <Modal
        title="Add Tag"
        open={tagModalOpen}
        onCancel={() => setTagModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddTag}>
          <Form.Item
            name="tag_name"
            label="Tag Name"
            rules={[{ required: true, message: 'Please enter tag name' }]}
          >
            <Input placeholder="Enter tag name" />
          </Form.Item>
          <Form.Item
            name="tag_type"
            label="Tag Type"
            rules={[{ required: true, message: 'Please select tag type' }]}
          >
            <Select placeholder="Select tag type">
              <Select.Option value="topic">Topic</Select.Option>
              <Select.Option value="format">Format</Select.Option>
              <Select.Option value="guest">Guest</Select.Option>
              <Select.Option value="custom">Custom</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add
              </Button>
              <Button onClick={() => setTagModalOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

// Ensure imports are used
const _ = [Popconfirm, DeleteOutlined]
