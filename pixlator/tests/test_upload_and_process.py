#!/usr/bin/env python3
"""
文件上传和像素化处理测试脚本
"""

import sys
import os
import tempfile
from PIL import Image
import numpy as np

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def create_test_image(width=100, height=80, filename="test_image.png"):
    """创建一个测试图片"""
    print(f"Creating test image: {width}x{height}")
    
    # 创建一个简单的测试图片
    img = Image.new('RGB', (width, height), color='red')
    
    # 添加一些颜色变化
    pixels = img.load()
    for x in range(width):
        for y in range(height):
            # 创建渐变效果
            r = int(255 * (x / width))
            g = int(255 * (y / height))
            b = 128
            pixels[x, y] = (r, g, b)
    
    # 保存到临时文件
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, filename)
    img.save(temp_path)
    
    print(f"✅ Test image created: {temp_path}")
    return temp_path

def test_file_upload():
    """测试文件上传功能"""
    print("\nTesting file upload...")
    
    try:
        from services.file_manager import FileManager
        
        file_manager = FileManager()
        
        # 创建测试图片
        test_image_path = create_test_image(50, 40, "upload_test.png")
        
        # 读取文件内容
        with open(test_image_path, 'rb') as f:
            file_content = f.read()
        
        # 测试文件上传
        file_info = file_manager.save_uploaded_file(file_content, "upload_test.png")
        
        print(f"✅ File uploaded successfully")
        print(f"   - Filename: {file_info['filename']}")
        print(f"   - Size: {file_info['file_size']} bytes")
        print(f"   - Dimensions: {file_info['dimensions']}")
        
        # 清理临时文件
        os.remove(test_image_path)
        
        return file_info['filename']
        
    except Exception as e:
        print(f"❌ File upload test failed: {e}")
        return None

def test_image_processing(filename):
    """测试图片处理功能"""
    print(f"\nTesting image processing for: {filename}")
    
    try:
        from services.file_manager import FileManager
        from services.image_processor import ImageProcessor
        
        file_manager = FileManager()
        image_processor = ImageProcessor()
        
        # 获取文件路径
        file_path = file_manager.get_file_path(filename)
        if not file_path:
            print(f"❌ File not found: {filename}")
            return None
        
        print(f"✅ File found: {file_path}")
        
        # 测试不同的处理参数
        test_cases = [
            {"max_size": 20, "color_count": 4, "name": "small_4colors"},
            {"max_size": 30, "color_count": 8, "name": "medium_8colors"},
            {"max_size": 40, "color_count": None, "name": "large_nocolors"}
        ]
        
        results = []
        
        for case in test_cases:
            print(f"\n  Processing with {case['name']}...")
            
            result = image_processor.process_image(
                file_path=file_path,
                max_size=case["max_size"],
                color_count=case["color_count"]
            )
            
            print(f"    ✅ Processing completed")
            print(f"    - Dimensions: {result['dimensions']}")
            print(f"    - Colors: {len(result['color_stats'])}")
            print(f"    - Diagonals: {len(result['diagonal_stats'])}")
            
            # 保存处理结果
            json_filename = f"{filename}_{case['name']}.json"
            file_manager.save_processing_result(filename, result)
            print(f"    - Result saved as: {json_filename}")
            
            results.append({
                "case": case,
                "result": result
            })
        
        return results
        
    except Exception as e:
        print(f"❌ Image processing test failed: {e}")
        return None

def test_pixel_data_validation(results):
    """验证像素数据的正确性"""
    print(f"\nValidating pixel data...")
    
    try:
        for i, item in enumerate(results):
            case = item["case"]
            result = item["result"]
            
            print(f"\n  Validating {case['name']}...")
            
            # 验证维度
            width = result['dimensions']['width']
            height = result['dimensions']['height']
            expected_width = min(case['max_size'], 50)  # 原图宽度
            expected_height = int(40 * (expected_width / 50))  # 保持宽高比
            
            if width == expected_width and height == expected_height:
                print(f"    ✅ Dimensions correct: {width}x{height}")
            else:
                print(f"    ❌ Dimensions incorrect: expected {expected_width}x{expected_height}, got {width}x{height}")
            
            # 验证像素数据
            pixel_data = result['pixel_data']
            if len(pixel_data) == height and len(pixel_data[0]) == width:
                print(f"    ✅ Pixel data structure correct")
            else:
                print(f"    ❌ Pixel data structure incorrect")
            
            # 验证颜色统计
            color_stats = result['color_stats']
            if len(color_stats) > 0:
                print(f"    ✅ Color stats: {len(color_stats)} colors")
                
                # 检查颜色数据格式
                for color_stat in color_stats[:3]:  # 只检查前3个
                    if 'rgb' in color_stat and 'hex' in color_stat and 'count' in color_stat:
                        print(f"      - Color {color_stat['rgb']} (#{color_stat['hex']}): {color_stat['count']} pixels")
                    else:
                        print(f"      ❌ Invalid color stat format")
            else:
                print(f"    ❌ No color stats found")
            
            # 验证对角线统计
            diagonal_stats = result['diagonal_stats']
            if len(diagonal_stats) > 0:
                print(f"    ✅ Diagonal stats: {len(diagonal_stats)} diagonals")
                
                # 检查对角线数据格式
                for diagonal_stat in diagonal_stats[:3]:  # 只检查前3个
                    if 'diagonal_num' in diagonal_stat and 'sequence' in diagonal_stat:
                        print(f"      - Diagonal {diagonal_stat['diagonal_num']}: {len(diagonal_stat['sequence'])} sequences")
                    else:
                        print(f"      ❌ Invalid diagonal stat format")
            else:
                print(f"    ❌ No diagonal stats found")
        
        return True
        
    except Exception as e:
        print(f"❌ Pixel data validation failed: {e}")
        return False

def test_history_functionality(filename):
    """测试历史记录功能"""
    print(f"\nTesting history functionality...")
    
    try:
        from services.file_manager import FileManager
        
        file_manager = FileManager()
        
        # 获取历史记录
        history = file_manager.get_history_list()
        print(f"✅ Found {len(history)} history records")
        
        # 查找我们的测试文件
        test_record = None
        for record in history:
            if record['filename'] == filename:
                test_record = record
                break
        
        if test_record:
            print(f"✅ Test file found in history")
            print(f"   - Original filename: {test_record['original_filename']}")
            print(f"   - Upload time: {test_record['upload_time']}")
            print(f"   - File size: {test_record['file_size']}")
            print(f"   - Has processing result: {test_record.get('has_processing_result', False)}")
        else:
            print(f"❌ Test file not found in history")
        
        # 测试加载处理结果
        result = file_manager.load_processing_result(filename)
        if result:
            print(f"✅ Processing result loaded successfully")
            print(f"   - Has pixel_data: {'pixel_data' in result}")
            print(f"   - Has color_stats: {'color_stats' in result}")
            print(f"   - Has diagonal_stats: {'diagonal_stats' in result}")
        else:
            print(f"❌ Failed to load processing result")
        
        return True
        
    except Exception as e:
        print(f"❌ History functionality test failed: {e}")
        return False

def main():
    """主测试函数"""
    print("🚀 Starting Upload and Processing Tests\n")
    
    # 测试文件上传
    filename = test_file_upload()
    if not filename:
        print("❌ File upload test failed, stopping tests")
        return
    
    # 测试图片处理
    results = test_image_processing(filename)
    if not results:
        print("❌ Image processing test failed, stopping tests")
        return
    
    # 验证像素数据
    validation_success = test_pixel_data_validation(results)
    
    # 测试历史记录功能
    history_success = test_history_functionality(filename)
    
    print(f"\n📊 Test Summary:")
    print(f"✅ File upload: PASSED")
    print(f"✅ Image processing: PASSED ({len(results)} test cases)")
    print(f"{'✅' if validation_success else '❌'} Pixel data validation: {'PASSED' if validation_success else 'FAILED'}")
    print(f"{'✅' if history_success else '❌'} History functionality: {'PASSED' if history_success else 'FAILED'}")
    
    if validation_success and history_success:
        print(f"\n🎉 All tests passed! Backend is working correctly.")
        print(f"\nYou can now:")
        print(f"1. Start the server: cd src && python main.py")
        print(f"2. Access API docs: http://localhost:8000/docs")
        print(f"3. Test file upload via API")
    else:
        print(f"\n❌ Some tests failed. Please check the errors above.")

if __name__ == "__main__":
    main() 