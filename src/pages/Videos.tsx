import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Table,
  Tag,
  Space,
  Button,
  Select,
  Input,
  Image,
  Tooltip,
  Progress,
} from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { videosApi, VideoListParams } from '../api/videos'
import { Video, AnalysisStatus } from '../types/video'
import { useAppStore } from '../store'
import dayjs from 'dayjs'

const analysisStatusColors: Record<AnalysisStatus, string> = {
  pending: 'default',
  analyzing: 'processing',
  completed: 'success',
  failed: 'error',
}

export default function Videos() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { videos, setVideos } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })
  const [filters, setFilters] = useState<VideoListParams>({
    task_id: searchParams.get('task_id') || undefined,
    is_dialogue: searchParams.get('is_dialogue') === 'true' ? true : undefined,
    search: searchParams.get('search') || undefined,
  })

  const fetchVideos = useCallback(async (params: VideoListParams = {}) => {
    setLoading(true)
    try {
      const response = await videosApi.list({
        page: params.page || pagination.page,
        page_size: params.page_size || pagination.pageSize,
        ...filters,
        ...params,
      })
      setVideos(response.data || [])
      setPagination({
        page: response.meta.page,
        pageSize: response.meta.page_size,
        total: response.meta.total,
      })
    } catch (error) {
      console.error('Failed to fetch videos:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.pageSize, setVideos])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const handleFilterChange = (key: keyof VideoListParams, value: unknown) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    // Update URL
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') {
        params.set(k, String(v))
      }
    })
    setSearchParams(params)
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const blob = await videosApi.export({ format, ...filters })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `videos.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
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

  const columns: ColumnsType<Video> = [
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail_url',
      key: 'thumbnail',
      width: 120,
      render: (url: string) => (
        url ? <Image src={url} width={100} preview={false} /> : '-'
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record: Video) => (
        <a onClick={() => navigate(`/videos/${record.id}`)}>{title}</a>
      ),
    },
    {
      title: 'Channel',
      dataIndex: 'channel_name',
      key: 'channel_name',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Duration',
      dataIndex: 'duration_seconds',
      key: 'duration',
      width: 80,
      render: formatDuration,
    },
    {
      title: 'Analysis',
      dataIndex: 'analysis_status',
      key: 'analysis_status',
      width: 100,
      render: (status: AnalysisStatus) => (
        <Tag color={analysisStatusColors[status]}>{status}</Tag>
      ),
    },
    {
      title: 'Dialogue',
      key: 'dialogue',
      width: 120,
      render: (_: unknown, record: Video) => {
        if (record.is_dialogue === undefined) {
          return <QuestionCircleOutlined style={{ color: '#999' }} />
        }
        return (
          <Space>
            {record.is_dialogue ? (
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            ) : (
              <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            )}
            {record.dialogue_confidence !== undefined && (
              <Tooltip title="Confidence">
                <Progress
                  type="circle"
                  percent={Math.round(record.dialogue_confidence * 100)}
                  size={30}
                  format={(p) => `${p}%`}
                />
              </Tooltip>
            )}
          </Space>
        )
      },
    },
    {
      title: 'Reviewed',
      dataIndex: 'reviewed',
      key: 'reviewed',
      width: 80,
      render: (reviewed: boolean, record: Video) => {
        if (!reviewed) return <Tag>Pending</Tag>
        return record.review_result ? (
          <Tag color="success">Confirmed</Tag>
        ) : (
          <Tag color="error">Rejected</Tag>
        )
      },
    },
    {
      title: 'Published',
      dataIndex: 'published_at',
      key: 'published_at',
      width: 100,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Videos</h2>
        <Space>
          <Button
            icon={<ExportOutlined />}
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={() => handleExport('json')}
          >
            Export JSON
          </Button>
        </Space>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Search videos..."
          allowClear
          style={{ width: 250 }}
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          onSearch={() => fetchVideos({ page: 1 })}
        />
        <Select
          placeholder="Dialogue Status"
          allowClear
          style={{ width: 150 }}
          value={filters.is_dialogue}
          onChange={(v) => handleFilterChange('is_dialogue', v)}
        >
          <Select.Option value={true}>Dialogue</Select.Option>
          <Select.Option value={false}>Not Dialogue</Select.Option>
        </Select>
        <Select
          placeholder="Analysis Status"
          allowClear
          style={{ width: 150 }}
          value={filters.analysis_status}
          onChange={(v) => handleFilterChange('analysis_status', v)}
        >
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="analyzing">Analyzing</Select.Option>
          <Select.Option value="completed">Completed</Select.Option>
          <Select.Option value="failed">Failed</Select.Option>
        </Select>
        <Select
          placeholder="Review Status"
          allowClear
          style={{ width: 150 }}
          value={filters.reviewed}
          onChange={(v) => handleFilterChange('reviewed', v)}
        >
          <Select.Option value={true}>Reviewed</Select.Option>
          <Select.Option value={false}>Not Reviewed</Select.Option>
        </Select>
      </Space>

      <Table
        columns={columns}
        dataSource={videos}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} videos`,
          onChange: (page, pageSize) => fetchVideos({ page, page_size: pageSize }),
        }}
      />
    </div>
  )
}
