import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Progress,
  Spin,
  Row,
  Col,
  Statistic,
} from 'antd'
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
} from '@ant-design/icons'
import { useTasks } from '../hooks/useTasks'
import { useAppStore } from '../store'
import { TaskStatus } from '../types/task'
import dayjs from 'dayjs'

const statusColors: Record<TaskStatus, string> = {
  pending: 'default',
  running: 'processing',
  paused: 'warning',
  completed: 'success',
  failed: 'error',
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentTask } = useAppStore()
  const { loading, fetchTask, startTask, pauseTask, stopTask } = useTasks()

  useEffect(() => {
    if (id) {
      fetchTask(id)
    }
  }, [id, fetchTask])

  if (loading || !currentTask) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  const task = currentTask

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/tasks')}
        style={{ marginBottom: 16 }}
      >
        Back to Tasks
      </Button>

      <Card
        title={task.name}
        extra={
          <Space>
            {task.status === 'pending' && (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => startTask(task.id)}
              >
                Start
              </Button>
            )}
            {task.status === 'running' && (
              <>
                <Button
                  icon={<PauseCircleOutlined />}
                  onClick={() => pauseTask(task.id)}
                >
                  Pause
                </Button>
                <Button
                  icon={<StopOutlined />}
                  onClick={() => stopTask(task.id)}
                >
                  Stop
                </Button>
              </>
            )}
            {task.status === 'paused' && (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => startTask(task.id)}
              >
                Resume
              </Button>
            )}
          </Space>
        }
      >
        <Descriptions column={2}>
          <Descriptions.Item label="Status">
            <Tag color={statusColors[task.status]}>{task.status.toUpperCase()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Type">{task.type}</Descriptions.Item>
          <Descriptions.Item label="Created">
            {dayjs(task.created_at).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="Updated">
            {dayjs(task.updated_at).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          {task.started_at && (
            <Descriptions.Item label="Started">
              {dayjs(task.started_at).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          )}
          {task.completed_at && (
            <Descriptions.Item label="Completed">
              {dayjs(task.completed_at).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          )}
          {task.keywords && task.keywords.length > 0 && (
            <Descriptions.Item label="Keywords" span={2}>
              {task.keywords.map((kw) => (
                <Tag key={kw}>{kw}</Tag>
              ))}
            </Descriptions.Item>
          )}
          {task.channels && task.channels.length > 0 && (
            <Descriptions.Item label="Channels" span={2}>
              {task.channels.map((ch) => (
                <Tag key={ch}>{ch}</Tag>
              ))}
            </Descriptions.Item>
          )}
          {task.error_message && (
            <Descriptions.Item label="Error" span={2}>
              <span style={{ color: '#ff4d4f' }}>{task.error_message}</span>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="Progress" style={{ marginTop: 16 }}>
        <Progress
          percent={task.progress}
          status={task.status === 'failed' ? 'exception' : undefined}
          style={{ marginBottom: 24 }}
        />

        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="Videos Found" value={task.total_found} />
          </Col>
          <Col span={8}>
            <Statistic title="Videos Analyzed" value={task.total_analyzed} />
          </Col>
          <Col span={8}>
            <Statistic
              title="Dialogues Confirmed"
              value={task.total_confirmed}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
        </Row>
      </Card>

      <Card title="Actions" style={{ marginTop: 16 }}>
        <Space>
          <Button
            onClick={() => navigate(`/videos?task_id=${task.id}`)}
          >
            View Videos
          </Button>
          <Button
            onClick={() => navigate(`/videos?task_id=${task.id}&is_dialogue=true`)}
          >
            View Dialogue Videos
          </Button>
        </Space>
      </Card>
    </div>
  )
}
