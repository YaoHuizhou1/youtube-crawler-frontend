# YouTube 双人对话视频抓取系统 - 前端应用

React + TypeScript + Ant Design 实现的管理界面。

## 技术栈

- **框架**: React 18
- **语言**: TypeScript 5
- **UI 组件库**: Ant Design 5
- **状态管理**: Zustand
- **路由**: React Router 6
- **HTTP 客户端**: Axios
- **构建工具**: Vite

## 项目结构

```
youtube-crawler-frontend/
├── src/
│   ├── api/                # API 请求封装
│   │   ├── client.ts       # Axios 客户端
│   │   ├── tasks.ts        # 任务 API
│   │   └── videos.ts       # 视频 API
│   ├── components/         # 可复用组件
│   │   └── Layout/         # 布局组件
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useTasks.ts     # 任务相关逻辑
│   │   └── useWebSocket.ts # WebSocket 连接
│   ├── pages/              # 页面组件
│   │   ├── Dashboard.tsx   # 仪表盘
│   │   ├── Tasks.tsx       # 任务列表
│   │   ├── TaskDetail.tsx  # 任务详情
│   │   ├── Videos.tsx      # 视频列表
│   │   └── VideoDetail.tsx # 视频详情
│   ├── store/              # 状态管理
│   │   └── index.ts        # Zustand store
│   ├── types/              # TypeScript 类型
│   │   ├── task.ts
│   │   └── video.ts
│   ├── App.tsx             # 路由配置
│   ├── main.tsx            # 入口文件
│   └── index.css           # 全局样式
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── nginx.conf              # Nginx 配置
└── Dockerfile
```

## 环境要求

- Node.js 18+
- npm 或 yarn

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API 地址

开发环境下，Vite 会将 `/api` 请求代理到后端服务。

编辑 `vite.config.ts` 修改代理配置：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',  // 后端地址
      changeOrigin: true,
    },
    '/ws': {
      target: 'ws://localhost:8080',
      ws: true,
    },
  },
}
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

## 功能页面

### Dashboard (仪表盘)

- 总体统计数据展示
- 任务状态概览
- 视频分析统计

### Tasks (任务管理)

- 任务列表展示
- 创建新任务
- 启动/暂停/停止任务
- 查看任务进度

### Videos (视频列表)

- 视频列表展示（支持分页）
- 多条件筛选（对话状态、分析状态、标签等）
- 导出数据（CSV/JSON）

### Video Detail (视频详情)

- 视频基本信息
- 分析结果展示
- 人工复核功能
- 标签管理
- 对话时间段展示

## 状态管理

使用 Zustand 进行状态管理：

```typescript
// store/index.ts
interface AppState {
  // 任务
  tasks: Task[]
  currentTask: Task | null

  // 视频
  videos: Video[]
  currentVideo: Video | null

  // WebSocket
  wsConnected: boolean
  notifications: Notification[]

  // 统计
  stats: OverviewStats | null
}
```

## WebSocket 实时通知

应用会自动连接 WebSocket 接收实时通知：

- 任务状态变更
- 视频分析完成
- 新视频发现

```typescript
// hooks/useWebSocket.ts
export function useWebSocket() {
  // 自动连接并处理消息
  // 断线自动重连
}
```

## Docker 部署

### 构建镜像

```bash
docker build -t youtube-crawler-frontend .
```

### 运行容器

```bash
docker run -p 3000:80 youtube-crawler-frontend
```

### Nginx 配置说明

`nginx.conf` 配置了：

- SPA 路由支持 (所有路由返回 index.html)
- API 代理 (/api -> 后端服务)
- WebSocket 代理 (/ws -> 后端服务)

## 开发指南

### 添加新页面

1. 在 `src/pages/` 创建页面组件
2. 在 `src/App.tsx` 添加路由
3. 在 `src/components/Layout/` 添加菜单项

### 添加新 API

1. 在 `src/api/` 创建 API 模块
2. 在 `src/types/` 定义类型
3. 创建对应的 hooks 封装业务逻辑

### 添加新组件

1. 在 `src/components/` 创建组件目录
2. 创建 `index.tsx` 导出组件
3. 可选：添加样式文件

## 代码规范

- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 使用 ESLint 进行代码检查

```bash
npm run lint
```

## 相关项目

- [youtube-crawler-backend](../youtube-crawler-backend) - Go 后端服务
- [youtube-crawler-ml](../youtube-crawler-ml) - Python ML 服务

## License

MIT
