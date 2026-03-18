import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  Progress,
} from 'antd'
import {
  PlusOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useTasks } from '../hooks/useTasks'
import { Task, TaskType, TaskStatus, CreateTaskRequest } from '../types/task'
import dayjs from 'dayjs'

const statusColors: Record<TaskStatus, string> = {
  pending: 'default',
  running: 'processing',
  paused: 'warning',
  completed: 'success',
  failed: 'error',
}

const typeLabels: Record<TaskType, string> = {
  keyword_search: 'Keyword Search',
  channel_monitor: 'Channel Monitor',
  playlist: 'Playlist',
}

export default function Tasks() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [modalOpen, setModalOpen] = useState(false)
  const {
    tasks,
    loading,
    pagination,
    fetchTasks,
    createTask,
    deleteTask,
    startTask,
    pauseTask,
    stopTask,
  } = useTasks()

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleCreate = async (values: CreateTaskRequest) => {
    const task = await createTask(values)
    if (task) {
      setModalOpen(false)
      form.resetFields()
    }
  }

  const columns: ColumnsType<Task> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Task) => (
        <a onClick={() => navigate(`/tasks/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: TaskType) => typeLabels[type],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: TaskStatus) => (
        <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_: unknown, record: Task) => (
        <div style={{ width: 150 }}>
          <Progress
            percent={record.progress}
            size="small"
            status={record.status === 'failed' ? 'exception' : undefined}
          />
          <small>
            {record.total_found} found / {record.total_confirmed} confirmed
          </small>
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Task) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => startTask(record.id)}
            >
              Start
            </Button>
          )}
          {record.status === 'running' && (
            <>
              <Button
                size="small"
                icon={<PauseCircleOutlined />}
                onClick={() => pauseTask(record.id)}
              >
                Pause
              </Button>
              <Button
                size="small"
                icon={<StopOutlined />}
                onClick={() => stopTask(record.id)}
              >
                Stop
              </Button>
            </>
          )}
          {record.status === 'paused' && (
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => startTask(record.id)}
            >
              Resume
            </Button>
          )}
          <Popconfirm
            title="Delete this task?"
            onConfirm={() => deleteTask(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Tasks</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Create Task
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => fetchTasks({ page, page_size: pageSize }),
        }}
      />

      <Modal
        title="Create Task"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Task Name"
            rules={[{ required: true, message: 'Please enter task name' }]}
          >
            <Input placeholder="Enter task name" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Task Type"
            rules={[{ required: true, message: 'Please select task type' }]}
          >
            <Select placeholder="Select task type">
              <Select.Option value="keyword_search">Keyword Search</Select.Option>
              <Select.Option value="channel_monitor">Channel Monitor</Select.Option>
              <Select.Option value="playlist">Playlist</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.type !== curr.type}
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type')
              if (type === 'keyword_search') {
                return (
                  <Form.Item
                    name={['config', 'keywords']}
                    label="Keywords"
                    rules={[{ required: true, message: 'Please enter keywords' }]}
                  >
                    <Select
                      mode="tags"
                      placeholder="Enter keywords (press Enter to add)"
                    />
                  </Form.Item>
                )
              }
              if (type === 'channel_monitor') {
                return (
                  <Form.Item
                    name={['config', 'channel_ids']}
                    label="Channel IDs"
                    rules={[{ required: true, message: 'Please enter channel IDs' }]}
                  >
                    <Select
                      mode="tags"
                      placeholder="Enter YouTube channel IDs"
                    />
                  </Form.Item>
                )
              }
              if (type === 'playlist') {
                return (
                  <Form.Item
                    name={['config', 'playlist_id']}
                    label="Playlist ID"
                    rules={[{ required: true, message: 'Please enter playlist ID' }]}
                  >
                    <Input placeholder="Enter YouTube playlist ID" />
                  </Form.Item>
                )
              }
              return null
            }}
          </Form.Item>

          <Form.Item
            name={['config', 'max_results']}
            label="Max Results"
            initialValue={50}
          >
            <Input type="number" min={1} max={500} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
