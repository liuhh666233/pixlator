from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Query
from fastapi.responses import FileResponse, JSONResponse
import os
from loguru import logger
from api.models import (
    UploadResponse, ProcessRequest, ProcessResponse
)
from services.file_manager import FileManager
from services.image_processor import ImageProcessor
from config import settings

router = APIRouter()

# 创建服务实例
file_manager = FileManager()
image_processor = ImageProcessor()

@router.post("/upload", response_model=UploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """上传图片"""
    try:
        # 验证文件类型
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file format. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )
        
        # 验证文件大小
        file_content = await file.read()
        if len(file_content) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE // 1024 // 1024}MB"
            )
        
        # 保存文件
        file_info = file_manager.save_uploaded_file(file_content, file.filename)
        
        logger.info(f"File uploaded successfully: {file_info['filename']}")
        
        return UploadResponse(
            filename=file_info["filename"],
            original_filename=file_info["original_filename"],
            size=file_info["file_size"],
            preview_url=f"/api/preview/{file_info['filename']}",
            dimensions=file_info["dimensions"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file")

@router.post("/process", response_model=ProcessResponse)
async def process_image(request: ProcessRequest):
    """处理图片"""
    try:
        # 获取文件路径
        file_path = file_manager.get_file_path(request.filename)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")
        
        # 处理图片
        result = image_processor.process_image(
            file_path=file_path,
            max_size=request.max_size,
            color_count=request.color_count
        )
        
        # 保存处理结果
        file_manager.save_processing_result(request.filename, result)
        
        logger.info(f"Image processed successfully: {request.filename}")
        
        return ProcessResponse(
            pixel_data=result["pixel_data"],
            color_stats=result["color_stats"],
            diagonal_stats=result["diagonal_stats"],
            dimensions=result["dimensions"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="Failed to process image")

@router.get("/history")
async def get_history():
    """获取历史记录列表"""
    try:
        history = file_manager.get_history_list()
        
        return {
            "success": True,
            "data": history
        }
        
    except Exception as e:
        logger.error(f"Error getting history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get history")

@router.get("/history/{filename}")
async def get_history_detail(filename: str):
    """获取历史记录详情"""
    try:
        # 检查文件是否存在
        file_path = file_manager.get_file_path(filename)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")
        
        # 加载处理结果
        result = file_manager.load_processing_result(filename)
        if not result:
            raise HTTPException(status_code=404, detail="Processing result not found")
        
        return {
            "success": True,
            "data": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting history detail: {e}")
        raise HTTPException(status_code=500, detail="Failed to get history detail")

@router.get("/preview/{filename}")
async def get_image_preview(filename: str):
    """获取图片预览"""
    try:
        file_path = file_manager.get_file_path(filename)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(
            path=file_path,
            media_type="image/*",
            filename=filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting image preview: {e}")
        raise HTTPException(status_code=500, detail="Failed to get image preview")

@router.delete("/files/{filename}")
async def delete_file(filename: str):
    """删除文件"""
    try:
        success = file_manager.delete_file(filename)
        if not success:
            raise HTTPException(status_code=404, detail="File not found")
        
        logger.info(f"File deleted successfully: {filename}")
        
        return {
            "success": True,
            "data": {
                "message": "File deleted successfully"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete file")

@router.post("/export/{filename}")
async def export_result(filename: str, export_type: str = Form(...), pixel_size: int = Form(10)):
    """导出处理结果"""
    try:
        # 检查文件是否存在
        file_path = file_manager.get_file_path(filename)
        if not file_path:
            raise HTTPException(status_code=404, detail="File not found")
        
        # 加载处理结果
        result = file_manager.load_processing_result(filename)
        if not result:
            raise HTTPException(status_code=404, detail="Processing result not found")
        
        # TODO: 实现导出功能
        # 这里暂时返回一个占位符响应
        export_filename = f"export_{filename}_{export_type}"
        
        logger.info(f"Export requested: {filename} -> {export_type}")
        
        return {
            "success": True,
            "data": {
                "download_url": f"/api/download/{export_filename}",
                "filename": export_filename,
                "file_size": 0  # TODO: 计算实际文件大小
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting result: {e}")
        raise HTTPException(status_code=500, detail="Failed to export result")

@router.get("/download/{filename}")
async def download_export(filename: str):
    """下载导出文件"""
    try:
        # TODO: 实现下载功能
        # 这里暂时返回404
        raise HTTPException(status_code=404, detail="Export file not found")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading export: {e}")
        raise HTTPException(status_code=500, detail="Failed to download export")

@router.get("/stats")
async def get_stats():
    """获取系统统计信息"""
    try:
        history = file_manager.get_history_list()
        
        total_files = len(history)
        total_size = sum(item["file_size"] for item in history)
        processed_files = sum(1 for item in history if item.get("has_processing_result", False))
        
        return {
            "success": True,
            "data": {
                "total_files": total_files,
                "total_size": total_size,
                "processed_files": processed_files,
                "upload_dir": settings.UPLOAD_DIR
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get stats") 