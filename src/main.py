import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from datetime import datetime
from loguru import logger

# 导入配置和服务
from config import settings
from services.file_manager import FileManager
from services.image_processor import ImageProcessor

# 导入路由
from api.routes import router as api_router

# 配置loguru日志
logger.remove()  # 移除默认处理器
logger.add(
    "logs/pixlator.log",
    rotation="10 MB",
    retention="7 days",
    level="INFO",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}"
)
logger.add(
    lambda msg: print(msg, end=""),
    level="INFO",
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | <level>{message}</level>"
)



# 创建FastAPI应用
app = FastAPI(
    title="Pixlator API",
    description="图片像素化处理工具API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建uploads目录
uploads_dir = settings.UPLOAD_DIR
os.makedirs(uploads_dir, exist_ok=True)

# 挂载静态文件服务
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# 全局异常处理器
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred",
            "timestamp": datetime.now().isoformat()
        }
    )

# 健康检查端点
@app.get("/health")
async def health_check():
    logger.info("Health check requested")
    return {
        "success": True,
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": settings.APP_VERSION
    }

# 根端点
@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {
        "success": True,
        "message": "Pixlator API is running",
        "docs": "/docs",
        "health": "/health"
    }

# 注册API路由
app.include_router(api_router, prefix="/api")

def main():
    """主函数"""
    import uvicorn
    
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Upload directory: {settings.get_upload_path()}")
    logger.info(f"Max file size: {settings.MAX_FILE_SIZE // 1024 // 1024}MB")
    logger.info(f"Allowed extensions: {settings.ALLOWED_EXTENSIONS}")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )

if __name__ == "__main__":
    main()
