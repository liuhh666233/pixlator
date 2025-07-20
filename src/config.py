import os
from typing import List
from loguru import logger

class Settings:
    """应用配置类"""
    
    # 应用基本信息
    APP_NAME: str = "Pixlator"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # 服务器配置
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # 文件上传配置
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
    ALLOWED_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".gif", ".bmp"]
    
    # CORS配置
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # 图片处理配置
    DEFAULT_MAX_SIZE: int = int(os.getenv("DEFAULT_MAX_SIZE", "100"))
    MAX_PROCESSING_SIZE: int = int(os.getenv("MAX_PROCESSING_SIZE", "500"))
    DEFAULT_COLOR_COUNT: int = int(os.getenv("DEFAULT_COLOR_COUNT", "8"))
    
    # 文件清理配置
    CLEANUP_INTERVAL: int = int(os.getenv("CLEANUP_INTERVAL", "86400"))  # 24小时
    FILE_RETENTION_DAYS: int = int(os.getenv("FILE_RETENTION_DAYS", "7"))
    
    @classmethod
    def get_upload_path(cls) -> str:
        """获取上传目录的绝对路径"""
        return os.path.abspath(cls.UPLOAD_DIR)
    
    @classmethod
    def ensure_upload_dir(cls) -> None:
        """确保上传目录存在"""
        os.makedirs(cls.UPLOAD_DIR, exist_ok=True)

# 创建全局配置实例
settings = Settings() 