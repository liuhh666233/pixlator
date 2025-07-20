# Pixlator 开发文档

## 开发环境设置

### 1. 后端环境
```bash
# 进入Nix开发环境
nix develop

# 启动后端服务
cd src
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 前端环境
```bash
# 启动前端开发服务器
cd webapp
yarn dev
```

## 开发流程

### Phase 1: 后端API基础框架 ✅ COMPLETED

#### 1.1 创建FastAPI应用 ✅
- [x] 创建 `src/main.py` - FastAPI应用入口
- [x] 配置CORS和中间件
- [x] 设置静态文件服务
- [x] 配置loguru日志系统

#### 1.2 实现文件管理服务 ✅
- [x] 创建 `src/services/file_manager.py`
- [x] 实现文件上传和存储
- [x] 实现JSON结果保存和加载
- [x] 实现历史记录扫描
- [x] 实现文件清理功能

#### 1.3 实现图片处理服务 ✅
- [x] 创建 `src/services/image_processor.py`
- [x] 移植现有的像素化处理逻辑
- [x] 实现颜色聚类功能
- [x] 实现对角线分析功能
- [x] 实现像素数据生成

#### 1.4 实现API路由 ✅
- [x] 创建 `src/api/routes.py`
- [x] 实现图片上传API (`POST /api/upload`)
- [x] 实现图片处理API (`POST /api/process`)
- [x] 实现历史记录API (`GET /api/history`)
- [x] 实现文件预览API (`GET /api/preview/{filename}`)
- [x] 实现文件删除API (`DELETE /api/files/{filename}`)
- [x] 实现统计信息API (`GET /api/stats/{filename}`)

#### 1.5 测试和验证 ✅
- [x] 创建 `src/tests/test_backend.py` - 基础功能测试
- [x] 创建 `src/tests/test_upload_and_process.py` - 上传和处理测试
- [x] 验证文件上传功能
- [x] 验证图片像素化处理
- [x] 验证数据持久化
- [x] 验证历史记录功能

### Phase 2: 前端基础组件 🚧 IN PROGRESS

#### 2.1 创建基础组件框架
- [ ] 创建 `webapp/src/App.tsx` - 主应用组件
- [ ] 创建 `webapp/src/types/index.ts` - TypeScript类型定义
- [ ] 创建 `webapp/src/utils/api.ts` - API调用工具

#### 2.2 实现图片上传组件
- [ ] 创建 `webapp/src/components/ImageUploader/`
- [ ] 实现拖拽上传功能
- [ ] 实现文件类型验证
- [ ] 实现上传进度显示

#### 2.3 实现图片预览组件
- [ ] 创建 `webapp/src/components/ImagePreview/`
- [ ] 实现图片预览显示
- [ ] 实现图片缩放功能

### Phase 3: 核心功能实现 (Day 5-7)

#### 3.1 实现像素网格组件
- [ ] 创建 `webapp/src/components/PixelGrid/`
- [ ] 实现CSS Grid布局
- [ ] 实现像素点渲染
- [ ] 实现对角线编号显示

#### 3.2 实现参数设置面板
- [ ] 创建 `webapp/src/components/ParameterPanel/`
- [ ] 实现尺寸滑块
- [ ] 实现颜色数量设置
- [ ] 实现处理按钮

#### 3.3 实现统计组件
- [ ] 创建 `webapp/src/components/ColorStats/`
- [ ] 创建 `webapp/src/components/DiagonalStats/`
- [ ] 实现统计表格显示
- [ ] 实现数据排序功能

### Phase 4: 高级功能实现 (Week 2)

#### 4.1 实现历史记录功能
- [ ] 创建 `webapp/src/components/HistoryPanel/`
- [ ] 创建 `webapp/src/hooks/useHistory.ts`
- [ ] 实现历史记录列表
- [ ] 实现记录恢复功能

#### 4.2 实现导出功能
- [ ] 创建 `webapp/src/components/ExportPanel/`
- [ ] 创建 `webapp/src/hooks/useExport.ts`
- [ ] 实现PNG导出
- [ ] 实现SVG导出

#### 4.3 实现交互功能
- [ ] 实现颜色高亮
- [ ] 实现对角线高亮
- [ ] 实现像素点击事件

## 接口规范

### 1. 图片上传接口

**请求**:
```http
POST /api/upload
Content-Type: multipart/form-data

Body: file (图片文件)
```

**响应**:
```json
{
  "success": true,
  "data": {
    "filename": "image_20240115_103000.jpg",
    "original_filename": "image.jpg",
    "size": 1024000,
    "preview_url": "/api/preview/image_20240115_103000.jpg",
    "dimensions": {
      "width": 800,
      "height": 600
    }
  }
}
```

### 2. 图片处理接口

**请求**:
```http
POST /api/process
Content-Type: application/json

{
  "filename": "image_20240115_103000.jpg",
  "max_size": 100,
  "color_count": 8
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "pixel_data": [
      [
        {
          "x": 0,
          "y": 0,
          "diagonal": 5,
          "color": [255, 0, 0],
          "hex": "FF0000"
        }
      ]
    ],
    "color_stats": [
      {
        "color_index": 1,
        "rgb": [255, 0, 0],
        "hex": "FF0000",
        "count": 150,
        "positions": [[0, 0], [1, 0]]
      }
    ],
    "diagonal_stats": [
      {
        "diagonal_num": 0,
        "sequence": [[1, 5], [2, 3]]
      }
    ],
    "dimensions": {
      "width": 100,
      "height": 80
    }
  }
}
```

### 3. 历史记录接口

**请求**:
```http
GET /api/history
```

**响应**:
```json
{
  "success": true,
  "data": [
    {
      "filename": "image_20240115_103000.jpg",
      "original_filename": "image.jpg",
      "upload_time": "2024-01-15T10:30:00Z",
      "preview_url": "/api/preview/image_20240115_103000.jpg"
    }
  ]
}
```

## 组件设计规范

### 1. 组件结构
```
ComponentName/
├── index.tsx          # 主组件文件
├── ComponentName.tsx  # 组件实现
├── ComponentName.styles.ts  # 样式文件
└── types.ts          # 组件类型定义
```

### 2. 组件Props规范
```typescript
interface ComponentNameProps {
  // 必需属性
  requiredProp: string;
  
  // 可选属性
  optionalProp?: number;
  
  // 回调函数
  onEvent?: (data: any) => void;
  
  // 样式属性
  className?: string;
  style?: React.CSSProperties;
}
```

### 3. 状态管理规范
```typescript
// 使用React Context进行全局状态管理
const AppContext = createContext<AppContextType | undefined>(undefined);

// 使用自定义Hook进行逻辑复用
const useImageProcessor = () => {
  // Hook实现
};
```

## 文件结构规范

### 1. 后端文件命名
- 文件名使用小写字母和下划线
- 类名使用PascalCase
- 函数名使用snake_case
- 常量使用大写字母和下划线

### 2. 前端文件命名
- 组件文件使用PascalCase
- Hook文件使用camelCase
- 工具文件使用camelCase
- 类型文件使用camelCase

### 3. 目录结构
```
src/
├── api/              # API相关
├── services/         # 业务逻辑服务
├── utils/            # 工具函数
└── config.py         # 配置文件

webapp/src/
├── components/       # React组件
├── hooks/           # 自定义Hook
├── types/           # TypeScript类型
└── utils/           # 工具函数
```

## 错误处理规范

### 1. 后端错误处理
```python
from fastapi import HTTPException

# 统一错误响应格式
class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None

# 抛出HTTP异常
raise HTTPException(
    status_code=400,
    detail="Invalid file format"
)
```

### 2. 前端错误处理
```typescript
// API调用错误处理
const handleApiError = (error: any) => {
  if (error.response) {
    // 服务器响应错误
    console.error('API Error:', error.response.data);
  } else if (error.request) {
    // 网络错误
    console.error('Network Error:', error.request);
  } else {
    // 其他错误
    console.error('Error:', error.message);
  }
};
```

## 测试规范

### 1. 后端测试
- 使用pytest进行单元测试
- 测试文件命名：`test_*.py`
- 测试函数命名：`test_*`

### 2. 前端测试
- 使用Jest和React Testing Library
- 测试文件命名：`*.test.tsx`
- 测试组件渲染和交互

## 部署规范

### 1. 开发环境
- 后端：localhost:8000
- 前端：localhost:5173
- 文件存储：./uploads

### 2. 生产环境
- 后端：FastAPI + Gunicorn
- 前端：Nginx静态文件服务
- 文件存储：/var/pixlator/uploads

## 开发检查清单

### 后端开发
- [ ] 代码符合PEP 8规范
- [ ] 添加适当的错误处理
- [ ] 添加日志记录
- [ ] 添加类型注解
- [ ] 添加文档字符串

### 前端开发
- [ ] 代码符合ESLint规范
- [ ] 组件有适当的PropTypes
- [ ] 添加错误边界
- [ ] 添加加载状态
- [ ] 添加响应式设计

### 通用检查
- [ ] 代码已测试
- [ ] 文档已更新
- [ ] 提交信息清晰
- [ ] 无敏感信息泄露 