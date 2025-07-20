import os
import json
import shutil
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from pathlib import Path
from PIL import Image
import uuid
from loguru import logger

from config import settings

class FileManager:
    """文件管理服务"""
    
    def __init__(self):
        self.upload_dir = settings.get_upload_path()
        settings.ensure_upload_dir()
        logger.info(f"FileManager initialized with upload directory: {self.upload_dir}")
    
    def generate_filename(self, original_filename: str) -> str:
        """生成安全的文件名"""
        # 获取文件扩展名
        ext = Path(original_filename).suffix.lower()
        
        # 验证文件扩展名
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported file extension: {ext}")
        
        # 生成时间戳和UUID
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        
        # 生成新文件名
        new_filename = f"{Path(original_filename).stem}_{timestamp}_{unique_id}{ext}"
        
        return new_filename
    
    def save_uploaded_file(self, file_content: bytes, original_filename: str) -> Dict:
        """保存上传的文件"""
        try:
            # 生成安全的文件名
            filename = self.generate_filename(original_filename)
            file_path = os.path.join(self.upload_dir, filename)
            
            # 保存文件
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            # 获取文件信息
            file_size = len(file_content)
            
            # 获取图片尺寸
            with Image.open(file_path) as img:
                width, height = img.size
            
            logger.info(f"File saved: {filename} ({file_size} bytes, {width}x{height})")
            
            return {
                "filename": filename,
                "original_filename": original_filename,
                "file_path": file_path,
                "file_size": file_size,
                "dimensions": {"width": width, "height": height},
                "upload_time": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error saving file {original_filename}: {e}")
            raise
    
    def save_processing_result(self, filename: str, result_data: Dict) -> str:
        """保存处理结果到JSON文件"""
        try:
            # 生成JSON文件名
            json_filename = f"{Path(filename).stem}.json"
            json_path = os.path.join(self.upload_dir, json_filename)
            
            # 添加元数据
            result_data["metadata"] = {
                "saved_time": datetime.now().isoformat(),
                "original_filename": filename
            }
            
            # 保存JSON文件
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(result_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Processing result saved: {json_filename}")
            return json_path
            
        except Exception as e:
            logger.error(f"Error saving processing result for {filename}: {e}")
            raise
    
    def load_processing_result(self, filename: str) -> Optional[Dict]:
        """从JSON文件加载处理结果"""
        try:
            json_filename = f"{Path(filename).stem}.json"
            json_path = os.path.join(self.upload_dir, json_filename)
            
            if not os.path.exists(json_path):
                logger.warning(f"Processing result not found: {json_filename}")
                return None
            
            with open(json_path, 'r', encoding='utf-8') as f:
                result_data = json.load(f)
            
            logger.info(f"Processing result loaded: {json_filename}")
            return result_data
            
        except Exception as e:
            logger.error(f"Error loading processing result for {filename}: {e}")
            return None
    
    def get_history_list(self) -> List[Dict]:
        """扫描目录获取历史记录列表"""
        try:
            history = []
            
            # 扫描uploads目录
            for file_path in Path(self.upload_dir).glob("*"):
                if file_path.is_file() and file_path.suffix.lower() in settings.ALLOWED_EXTENSIONS:
                    # 获取文件信息
                    stat = file_path.stat()
                    
                    # 获取图片尺寸
                    try:
                        with Image.open(file_path) as img:
                            width, height = img.size
                    except Exception:
                        width, height = 0, 0
                    
                    # 检查是否有对应的JSON文件
                    json_path = file_path.with_suffix('.json')
                    has_processing_result = json_path.exists()
                    
                    history.append({
                        "filename": file_path.name,
                        "original_filename": file_path.name,  # 这里可以改进，从JSON中读取原始文件名
                        "upload_time": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        "file_size": stat.st_size,
                        "dimensions": {"width": width, "height": height},
                        "preview_url": f"/api/preview/{file_path.name}",
                        "has_processing_result": has_processing_result
                    })
            
            # 按上传时间排序（最新的在前）
            history.sort(key=lambda x: x["upload_time"], reverse=True)
            
            logger.info(f"Found {len(history)} history records")
            return history
            
        except Exception as e:
            logger.error(f"Error scanning history: {e}")
            return []
    
    def delete_file(self, filename: str) -> bool:
        """删除文件及其相关文件"""
        try:
            file_path = os.path.join(self.upload_dir, filename)
            json_path = os.path.join(self.upload_dir, f"{Path(filename).stem}.json")
            
            # 删除主文件
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Deleted file: {filename}")
            
            # 删除JSON文件
            if os.path.exists(json_path):
                os.remove(json_path)
                logger.info(f"Deleted JSON file: {Path(filename).stem}.json")
            
            return True
            
        except Exception as e:
            logger.error(f"Error deleting file {filename}: {e}")
            return False
    
    def get_file_path(self, filename: str) -> Optional[str]:
        """获取文件的完整路径"""
        file_path = os.path.join(self.upload_dir, filename)
        if os.path.exists(file_path):
            return file_path
        return None
    
    def cleanup_old_files(self, days: int = None) -> int:
        """清理旧文件"""
        if days is None:
            days = settings.FILE_RETENTION_DAYS
        
        try:
            cutoff_time = datetime.now().timestamp() - (days * 24 * 60 * 60)
            deleted_count = 0
            
            for file_path in Path(self.upload_dir).glob("*"):
                if file_path.is_file():
                    if file_path.stat().st_mtime < cutoff_time:
                        try:
                            file_path.unlink()
                            deleted_count += 1
                            logger.info(f"Cleaned up old file: {file_path.name}")
                        except Exception as e:
                            logger.error(f"Error deleting old file {file_path.name}: {e}")
            
            logger.info(f"Cleanup completed: {deleted_count} files deleted")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
            return 0

 