import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Spin } from 'antd'
import {
  VideoCameraOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UnorderedListOutlined,
  SyncOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { statsApi, OverviewStats } from '../api/videos'
import { useAppStore } from '../store'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const { stats, setStats } = useAppStore()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsApi.overview()
        setStats(response.data || null)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [setStats])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  const data: OverviewStats = stats || {
    total_tasks: 0,
    running_tasks: 0,
    completed_tasks: 0,
    total_videos: 0,
    dialogue_videos: 0,
    analyzed_videos: 0,
    pending_analysis: 0,
    reviewed_videos: 0,
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Dashboard</h2>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={data.total_tasks}
              prefix={<UnorderedListOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Running Tasks"
              value={data.running_tasks}
              prefix={<SyncOutlined spin={data.running_tasks > 0} />}
              valueStyle={{ color: data.running_tasks > 0 ? '#1677ff' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed Tasks"
              value={data.completed_tasks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Videos"
              value={data.total_videos}
              prefix={<VideoCameraOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Dialogue Videos"
              value={data.dialogue_videos}
              suffix={data.total_videos > 0 ? `/ ${data.total_videos}` : ''}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Analyzed Videos"
              value={data.analyzed_videos}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Analysis"
              value={data.pending_analysis}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: data.pending_analysis > 0 ? '#faad14' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Reviewed Videos"
              value={data.reviewed_videos}
              prefix={<TagOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {data.total_videos > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card title="Analysis Summary">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Dialogue Rate"
                    value={((data.dialogue_videos / data.total_videos) * 100).toFixed(1)}
                    suffix="%"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Analysis Rate"
                    value={((data.analyzed_videos / data.total_videos) * 100).toFixed(1)}
                    suffix="%"
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Review Rate"
                    value={((data.reviewed_videos / data.total_videos) * 100).toFixed(1)}
                    suffix="%"
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}
