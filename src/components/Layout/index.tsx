import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, Badge, Tooltip } from 'antd'
import {
  DashboardOutlined,
  UnorderedListOutlined,
  VideoCameraOutlined,
  WifiOutlined,
} from '@ant-design/icons'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useAppStore } from '../../store'

const { Header, Sider, Content } = AntLayout

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/tasks',
    icon: <UnorderedListOutlined />,
    label: 'Tasks',
  },
  {
    key: '/videos',
    icon: <VideoCameraOutlined />,
    label: 'Videos',
  },
]

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { wsConnected, notifications } = useAppStore()

  // Initialize WebSocket connection
  useWebSocket()

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        style={{
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <h1 style={{ margin: 0, fontSize: collapsed ? 14 : 16 }}>
            {collapsed ? 'YT' : 'YT Crawler'}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname.split('/').slice(0, 2).join('/')]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 16,
          }}
        >
          <Tooltip title={wsConnected ? 'WebSocket connected' : 'WebSocket disconnected'}>
            <Badge status={wsConnected ? 'success' : 'error'}>
              <WifiOutlined style={{ fontSize: 18 }} />
            </Badge>
          </Tooltip>
          <Badge count={notifications.length} overflowCount={99}>
            <span>Notifications</span>
          </Badge>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
