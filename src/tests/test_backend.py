#!/usr/bin/env python3
"""
后端功能测试脚本
"""

import sys
import os

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def test_imports():
    """测试所有模块导入"""
    print("Testing imports...")
    
    try:
        from config import settings
        print("✅ Config imported successfully")
        
        from services.file_manager import FileManager
        print("✅ FileManager imported successfully")
        
        from services.image_processor import ImageProcessor
        print("✅ ImageProcessor imported successfully")
        
        from api.models import UploadResponse, ProcessRequest
        print("✅ API models imported successfully")
        
        from api.routes import router
        print("✅ API routes imported successfully")
        
        from main import app
        print("✅ FastAPI app imported successfully")
        
        print("\n🎉 All imports successful!")
        return True
        
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def test_config():
    """测试配置"""
    print("\nTesting configuration...")
    
    try:
        from config import settings
        
        print(f"✅ App name: {settings.APP_NAME}")
        print(f"✅ Upload dir: {settings.UPLOAD_DIR}")
        print(f"✅ Max file size: {settings.MAX_FILE_SIZE}")
        print(f"✅ Allowed extensions: {settings.ALLOWED_EXTENSIONS}")
        
        # 测试上传目录创建
        settings.ensure_upload_dir()
        upload_path = settings.get_upload_path()
        print(f"✅ Upload path: {upload_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Config test failed: {e}")
        return False

def test_services():
    """测试服务实例化"""
    print("\nTesting services...")
    
    try:
        from services.file_manager import FileManager
        from services.image_processor import ImageProcessor
        
        # 测试服务实例化
        file_manager = FileManager()
        print("✅ FileManager instantiated successfully")
        
        image_processor = ImageProcessor()
        print("✅ ImageProcessor instantiated successfully")
        
        # 测试文件名生成
        test_filename = "test_image.jpg"
        generated_name = file_manager.generate_filename(test_filename)
        print(f"✅ Generated filename: {generated_name}")
        
        return True
        
    except Exception as e:
        print(f"❌ Services test failed: {e}")
        return False

def test_api_routes():
    """测试API路由"""
    print("\nTesting API routes...")
    
    try:
        from api.routes import router, file_manager, image_processor
        
        print("✅ API router imported successfully")
        print("✅ FileManager instance available")
        print("✅ ImageProcessor instance available")
        
        # 测试路由数量
        routes = [route for route in router.routes]
        print(f"✅ Found {len(routes)} API routes")
        
        return True
        
    except Exception as e:
        print(f"❌ API routes test failed: {e}")
        return False

def main():
    """主测试函数"""
    print("🚀 Starting Pixlator Backend Tests\n")
    
    tests = [
        test_imports,
        test_config,
        test_services,
        test_api_routes
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is ready to run.")
        print("\nTo start the server, run:")
        print("cd src && python main.py")
        print("or")
        print("cd src && uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main() 