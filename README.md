# DeepSeek Chat Web

基于 DeepSeek API 的聊天 Web 应用，支持流式输出、思维链折叠、Markdown 渲染、多模型切换等功能。

## 功能

- 流式/非流式输出，实时显示回复
- deepseek-reasoner 模型思维链折叠展示
- Markdown 渲染 + 代码高亮 + 一键复制
- 多对话管理（新建/重命名/删除/搜索）
- 对话级模型切换
- 全局 System Prompt
- 参数调节（Temperature、Max Tokens、Max Context Tokens）
- 消息编辑 + 重新生成 + 停止生成
- 对话导出（Markdown / JSON）
- Token 用量统计 + 上限警告
- 亮色/暗色/跟随系统主题
- 离线检测 + 限流重试
- 移动端响应式适配

## 技术栈

- **前端**: React 18 + Vite + MUI v6 + Dexie.js (IndexedDB)
- **后端**: Express + SSE 流式代理
- **API**: DeepSeek API (OpenAI 兼容格式)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的 DeepSeek API Key：

```bash
cp .env.example .env
```

编辑 `.env`：

```
DEEPSEEK_API_KEY=your_actual_api_key
PORT=3001
```

### 3. 启动开发服务器

```bash
npm run dev
```

- 前端: http://localhost:5173
- 后端: http://localhost:3001

### 4. 生产构建

```bash
npm run build -w client
```

## 项目结构

```
deepseek_chat_web/
├── client/                  # React 前端
│   └── src/
│       ├── components/
│       │   ├── Chat/        # 聊天区组件
│       │   ├── Sidebar/     # 侧边栏组件
│       │   ├── Settings/    # 设置对话框
│       │   ├── Markdown/    # Markdown 渲染
│       │   └── Common/      # 通用组件
│       ├── hooks/           # React hooks
│       ├── utils/           # 工具函数
│       └── db/              # Dexie 数据库
├── server/                  # Express 后端
│   └── src/
│       ├── routes/          # API 路由
│       ├── services/        # 服务层
│       └── middleware/      # 中间件
└── .env                     # 环境变量
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |
| POST | /api/chat | 聊天补全（SSE 流式） |
| GET | /api/models | 获取可用模型列表 |
| POST | /api/count-tokens | 计算 Token 数量 |
