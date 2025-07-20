# Pixlator - 像素化图片处理工具

一个基于Web的图片像素化处理工具，支持实时预览、颜色聚类、对角线编号等功能。

## 功能特性

### 🎨 图片处理
- **图片上传**：支持拖拽上传和点击选择
- **实时预览**：上传后立即显示原图预览
- **尺寸调整**：自动调整图片尺寸，保持宽高比
- **颜色聚类**：使用K-means算法减少颜色数量

### 🔢 像素化功能
- **对角线编号**：从右下角开始的对角线编号系统
- **颜色统计**：统计每种颜色的使用次数和位置
- **对角线统计**：分析每条对角线的颜色构成序列
- **实时渲染**：前端React组件实时渲染像素图

### 🎯 交互体验
- **参数调节**：实时调整颜色数量和图片尺寸
- **即时反馈**：参数变化时立即更新像素图
- **响应式设计**：适配不同屏幕尺寸

## 技术架构

### 后端 (Python + FastAPI)
```
src/
├── main.py                 # FastAPI应用入口
├── api/
│   ├── __init__.py
│   ├── routes.py          # API路由定义
│   └── models.py          # Pydantic数据模型
├── services/
│   ├── __init__.py
│   ├── image_processor.py # 图片处理服务
│   ├── pixel_analyzer.py  # 像素分析服务
│   ├── file_manager.py    # 文件管理服务
│   └── export_service.py  # 导出服务
├── utils/
│   ├── __init__.py
│   ├── file_handler.py    # 文件处理工具
│   └── image_utils.py     # 图片工具函数
└── config.py              # 配置文件
```

### 前端 (React + TypeScript)
```
webapp/src/
├── components/
│   ├── ImageUploader/     # 图片上传组件
│   ├── PixelGrid/         # 像素网格组件
│   ├── ColorStats/        # 颜色统计组件
│   ├── DiagonalStats/     # 对角线统计组件
│   ├── ParameterPanel/    # 参数设置面板
│   ├── HistoryPanel/      # 历史记录面板
│   ├── ExportPanel/       # 导出面板
│   └── ImagePreview/      # 图片预览组件
├── hooks/
│   ├── useImageProcessor.ts  # 图片处理逻辑
│   ├── usePixelData.ts       # 像素数据管理
│   ├── useHistory.ts         # 历史记录管理
│   └── useExport.ts          # 导出功能
├── types/
│   └── index.ts             # TypeScript类型定义
└── utils/
    └── api.ts               # API调用工具
```

## 数据流程

### 1. 图片上传流程
```
用户上传图片 → 前端预览 → 后端保存图片 → 返回文件信息
```

### 2. 图片处理流程
```
用户设置参数 → 调用处理API → 后端像素化处理 → 保存JSON结果 → 返回像素数据 → 前端渲染
```

### 3. 历史记录流程
```
前端请求历史 → 后端扫描uploads目录 → 返回文件列表 → 前端展示历史记录
```

### 4. 恢复处理流程
```
用户点击历史记录 → 加载JSON文件 → 还原像素数据 → 前端重新渲染
```

### 5. 导出流程
```
用户选择导出 → 后端生成文件 → 返回下载链接 → 前端下载文件
```

## API设计

### 图片上传
```http
POST /api/upload
Content-Type: multipart/form-data

Response:
{
  "filename": "image_20240115_103000.jpg",
  "original_filename": "image.jpg",
  "size": 1024000,
  "preview_url": "/api/preview/image_20240115_103000.jpg",
  "dimensions": {"width": 800, "height": 600}
}
```

### 图片处理
```http
POST /api/process
Content-Type: application/json

{
  "filename": "image_20240115_103000.jpg",
  "max_size": 100,
  "color_count": 8
}

Response:
{
  "pixel_data": [
    [
      {
        "x": 0, "y": 0,
        "diagonal": 5,
        "color": [255, 0, 0],
        "hex": "FF0000"
      }
    ]
  ],
  "color_stats": [...],
  "diagonal_stats": [...],
  "dimensions": {"width": 100, "height": 80}
}
```

### 历史记录
```http
GET /api/history

Response:
[
  {
    "filename": "image_20240115_103000.jpg",
    "original_filename": "image.jpg",
    "upload_time": "2024-01-15T10:30:00Z",
    "preview_url": "/api/preview/image_20240115_103000.jpg"
  }
]
```

### 加载历史记录
```http
GET /api/history/{filename}

Response:
{
  "metadata": {...},
  "processing_params": {...},
  "pixel_data": [...],
  "color_stats": [...],
  "diagonal_stats": [...]
}
```

### 导出功能
```http
POST /api/export/{filename}
Content-Type: application/json

{
  "export_type": "png",  // "png", "svg", "json"
  "pixel_size": 10
}

Response:
{
  "download_url": "/api/download/export_20240115_103000.png"
}
```

## 核心组件设计

### PixelGrid 组件
```typescript
interface PixelGridProps {
  pixelData: PixelData[][];
  dimensions: { width: number; height: number };
  showDiagonalNumbers: boolean;
  pixelSize: number;
}

// 渲染逻辑：将像素数据转换为CSS Grid布局
// 每个像素点用div表示，背景色为对应颜色
```

### ColorStats 组件
```typescript
interface ColorStatsProps {
  colorStats: ColorStat[];
  onColorClick: (color: string) => void;
}

// 显示颜色统计表格，支持点击高亮对应颜色的像素
```

### DiagonalStats 组件
```typescript
interface DiagonalStatsProps {
  diagonalStats: DiagonalStat[];
  onDiagonalClick: (diagonalNum: number) => void;
}

// 显示对角线统计，支持点击高亮对应对角线的像素
```

## 开发环境设置

### 后端依赖
```python
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
Pillow==10.1.0
scikit-learn==1.3.2
numpy==1.24.3
```

### 前端依赖
```json
{
  "react": "^18.2.0",
  "typescript": "^5.8.2",
  "styled-components": "^6.1.8",
  "axios": "^1.6.7"
}
```

## 部署架构

### 开发环境
- 后端：FastAPI + Uvicorn (localhost:8000)
- 前端：Vite Dev Server (localhost:5173)
- 文件存储：本地临时目录

### 生产环境
- 后端：FastAPI + Gunicorn
- 前端：Nginx静态文件服务
- 文件存储：本地持久化目录
- 反向代理：Nginx

## 错误处理

### 图片格式验证
- 支持格式：JPG, PNG, GIF, BMP
- 文件大小限制：10MB
- 错误响应：400 Bad Request + 详细错误信息

### 处理失败处理
- 网络错误：重试机制
- 处理超时：异步任务 + 状态查询
- 内存不足：图片尺寸自动调整

## 性能优化

### 前端优化
- 虚拟滚动：大尺寸像素图的分页渲染
- 防抖处理：参数调整的实时预览
- 缓存机制：相同参数的重复请求缓存

### 后端优化
- 异步处理：大图片的异步处理
- 内存管理：及时清理临时文件
- 并发控制：限制同时处理的图片数量

## 开发计划

### Phase 1: 基础功能 (Week 1)
- [x] 项目架构设计
- [ ] 后端API基础框架
- [ ] 图片上传和存储
- [ ] 像素化处理核心逻辑
- [ ] 前端基础组件框架

### Phase 2: 核心功能 (Week 2)
- [ ] 像素网格渲染组件
- [ ] 参数设置面板
- [ ] 颜色统计展示
- [ ] 对角线统计展示
- [ ] 实时预览功能

### Phase 3: 高级功能 (Week 3)
- [ ] 历史记录管理
- [ ] 导出功能
- [ ] 图片预览组件
- [ ] 交互高亮功能
- [ ] 响应式设计

### Phase 4: 完善优化 (Week 4)
- [ ] 错误处理完善
- [ ] 性能优化
- [ ] 用户体验优化
- [ ] 测试和文档
- [ ] 部署配置