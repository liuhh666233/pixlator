# Pixlator Frontend

Pixlator 的前端应用，使用 React + TypeScript + Styled Components 构建。

## 功能特性

- 🖼️ 拖拽上传图片
- ⚙️ 实时参数调整
- 🎨 像素化处理
- 📊 颜色和对角线统计
- 📱 响应式设计
- 🔄 实时预览

## 技术栈

- **React 18** - 用户界面库
- **TypeScript** - 类型安全
- **Styled Components** - CSS-in-JS 样式
- **Vite** - 构建工具
- **Axios** - HTTP 客户端
- **React Dropzone** - 文件上传

## 开发环境

### 安装依赖

```bash
yarn install
```

### 启动开发服务器

```bash
yarn dev
```

应用将在 http://localhost:3000 启动。

### 构建生产版本

```bash
yarn build
```

### 预览生产版本

```bash
yarn preview
```

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ImageUploader/   # 图片上传组件
│   ├── ParameterPanel/  # 参数设置面板
│   ├── PixelGrid/       # 像素网格组件
│   ├── ColorStats/      # 颜色统计组件
│   ├── DiagonalStats/   # 对角线统计组件
│   ├── HistoryPanel/    # 历史记录面板
│   └── ExportPanel/     # 导出面板
├── hooks/               # 自定义 Hooks
├── services/            # API 服务
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数
├── styles/              # 全局样式
├── App.tsx              # 主应用组件
└── main.tsx             # 应用入口
```

## 组件说明

### ImageUploader
拖拽上传组件，支持文件类型验证和大小限制。

### ParameterPanel
参数设置面板，包含尺寸滑块和颜色数量选择。

### PixelGrid
像素网格组件，显示处理后的像素化图像。

### ColorStats
颜色统计组件，显示颜色分布和统计信息。

### DiagonalStats
对角线统计组件，显示对角线分析结果。

## API 集成

前端通过 `/api` 代理与后端通信，主要接口包括：

- `POST /api/upload` - 图片上传
- `POST /api/process` - 图片处理
- `GET /api/history` - 历史记录
- `GET /api/stats/{filename}` - 处理结果

## 开发规范

### 组件开发
- 使用 TypeScript 定义 Props 接口
- 使用 Styled Components 编写样式
- 遵循 React Hooks 最佳实践

### 样式规范
- 使用 CSS Grid 和 Flexbox 布局
- 响应式设计，支持移动端
- 统一的颜色和字体规范

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循 TypeScript 严格模式
- 组件和函数添加 JSDoc 注释

## 部署

构建后的文件位于 `dist/` 目录，可以部署到任何静态文件服务器。

## 许可证

MIT License 