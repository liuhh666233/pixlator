# Pixlator API 接口文档

## 基础信息

- **Base URL**: `http://localhost:8000`
- **Content-Type**: `application/json` (除文件上传外)
- **响应格式**: 统一JSON格式

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    // 具体数据
  }
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误描述",
  "detail": "详细错误信息"
}
```

## 接口列表

### 1. 图片上传

**接口地址**: `POST /api/upload`

**请求格式**: `multipart/form-data`

**请求参数**:
- `file`: 图片文件 (必需)

**支持的图片格式**:
- JPG/JPEG
- PNG
- GIF
- BMP

**文件大小限制**: 10MB

**响应示例**:
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

**错误响应**:
```json
{
  "success": false,
  "error": "Invalid file format",
  "detail": "Only JPG, PNG, GIF, BMP files are supported"
}
```

### 2. 图片处理

**接口地址**: `POST /api/process`

**请求参数**:
```json
{
  "filename": "image_20240115_103000.jpg",
  "max_size": 100,
  "color_count": 8
}
```

**参数说明**:
- `filename`: 图片文件名 (必需)
- `max_size`: 最大尺寸，保持宽高比 (可选，默认100)
- `color_count`: 颜色数量，使用K-means聚类 (可选，不限制则为null)

**响应示例**:
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
        },
        {
          "x": 1,
          "y": 0,
          "diagonal": 4,
          "color": [0, 255, 0],
          "hex": "00FF00"
        }
      ]
    ],
    "color_stats": [
      {
        "color_index": 1,
        "rgb": [255, 0, 0],
        "hex": "FF0000",
        "count": 150,
        "positions": [[0, 0], [1, 0], [2, 0]]
      },
      {
        "color_index": 2,
        "rgb": [0, 255, 0],
        "hex": "00FF00",
        "count": 120,
        "positions": [[0, 1], [1, 1]]
      }
    ],
    "diagonal_stats": [
      {
        "diagonal_num": 0,
        "sequence": [[1, 5], [2, 3]]
      },
      {
        "diagonal_num": 1,
        "sequence": [[1, 4], [2, 4]]
      }
    ],
    "dimensions": {
      "width": 100,
      "height": 80
    }
  }
}
```

### 3. 获取历史记录

**接口地址**: `GET /api/history`

**请求参数**: 无

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "filename": "image_20240115_103000.jpg",
      "original_filename": "image.jpg",
      "upload_time": "2024-01-15T10:30:00Z",
      "preview_url": "/api/preview/image_20240115_103000.jpg",
      "file_size": 1024000,
      "dimensions": {
        "width": 800,
        "height": 600
      }
    },
    {
      "filename": "photo_20240114_153000.png",
      "original_filename": "photo.png",
      "upload_time": "2024-01-14T15:30:00Z",
      "preview_url": "/api/preview/photo_20240114_153000.png",
      "file_size": 2048000,
      "dimensions": {
        "width": 1200,
        "height": 800
      }
    }
  ]
}
```

### 4. 加载历史记录详情

**接口地址**: `GET /api/history/{filename}`

**路径参数**:
- `filename`: 图片文件名

**响应示例**:
```json
{
  "success": true,
  "data": {
    "metadata": {
      "original_filename": "image.jpg",
      "upload_time": "2024-01-15T10:30:00Z",
      "file_size": 1024000,
      "original_dimensions": {
        "width": 800,
        "height": 600
      }
    },
    "processing_params": {
      "max_size": 100,
      "color_count": 8,
      "processed_dimensions": {
        "width": 100,
        "height": 75
      }
    },
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
    ]
  }
}
```

### 5. 图片预览

**接口地址**: `GET /api/preview/{filename}`

**路径参数**:
- `filename`: 图片文件名

**响应**: 图片文件流

**Content-Type**: 根据图片格式自动设置

### 6. 导出功能

**接口地址**: `POST /api/export/{filename}`

**路径参数**:
- `filename`: 图片文件名

**请求参数**:
```json
{
  "export_type": "png",
  "pixel_size": 10
}
```

**参数说明**:
- `export_type`: 导出类型，支持 "png", "svg", "json"
- `pixel_size`: 像素大小，用于PNG/SVG导出 (可选，默认10)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "download_url": "/api/download/export_image_20240115_103000.png",
    "filename": "export_image_20240115_103000.png",
    "file_size": 51200
  }
}
```

### 7. 下载导出文件

**接口地址**: `GET /api/download/{filename}`

**路径参数**:
- `filename`: 导出文件名

**响应**: 文件流

**Content-Type**: 根据文件类型自动设置

### 8. 删除文件

**接口地址**: `DELETE /api/files/{filename}`

**路径参数**:
- `filename`: 图片文件名

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "File deleted successfully"
  }
}
```

## 数据类型定义

### PixelData
```typescript
interface PixelData {
  x: number;           // X坐标
  y: number;           // Y坐标
  diagonal: number;    // 对角线编号
  color: [number, number, number];  // RGB颜色值
  hex: string;         // 十六进制颜色值
}
```

### ColorStat
```typescript
interface ColorStat {
  color_index: number;              // 颜色索引
  rgb: [number, number, number];    // RGB颜色值
  hex: string;                      // 十六进制颜色值
  count: number;                    // 使用次数
  positions: [number, number][];    // 使用位置列表
}
```

### DiagonalStat
```typescript
interface DiagonalStat {
  diagonal_num: number;             // 对角线编号
  sequence: [number, number][];     // 颜色序列 [(颜色索引, 数量), ...]
}
```

### ProcessingParams
```typescript
interface ProcessingParams {
  max_size: number;                 // 最大尺寸
  color_count?: number;             // 颜色数量（可选）
}
```

## 错误码说明

| 状态码 | 错误类型 | 说明 |
|--------|----------|------|
| 400 | Bad Request | 请求参数错误 |
| 404 | Not Found | 文件不存在 |
| 413 | Payload Too Large | 文件过大 |
| 415 | Unsupported Media Type | 不支持的文件格式 |
| 500 | Internal Server Error | 服务器内部错误 |

## 使用示例

### 完整处理流程

1. **上传图片**
```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@image.jpg"
```

2. **处理图片**
```bash
curl -X POST "http://localhost:8000/api/process" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "image_20240115_103000.jpg",
    "max_size": 100,
    "color_count": 8
  }'
```

3. **获取历史记录**
```bash
curl -X GET "http://localhost:8000/api/history"
```

4. **导出结果**
```bash
curl -X POST "http://localhost:8000/api/export/image_20240115_103000.jpg" \
  -H "Content-Type: application/json" \
  -d '{
    "export_type": "png",
    "pixel_size": 10
  }'
``` 