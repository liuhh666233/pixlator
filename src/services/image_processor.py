import os
from typing import List, Dict, Tuple, Optional, Literal
from datetime import datetime
from PIL import Image
import numpy as np
from sklearn.cluster import KMeans
from collections import defaultdict
from loguru import logger

from config import settings

# 定义编号方式类型
NumberingMode = Literal["top_to_bottom", "bottom_to_top", "diagonal_bottom_left", "diagonal_bottom_right"]

class ImageProcessor:
    """图片处理服务"""
    
    def __init__(self):
        self.logger = logger
    
    def process_image(self, file_path: str, max_size: int = None, color_count: int = None, numbering_mode: NumberingMode = "diagonal_bottom_right") -> Dict:
        """处理图片并返回像素化结果"""
        try:
            if max_size is None:
                max_size = settings.DEFAULT_MAX_SIZE
            if color_count is None:
                color_count = settings.DEFAULT_COLOR_COUNT
            
            self.logger.info(f"Processing image: {file_path} with max_size={max_size}, color_count={color_count}, numbering_mode={numbering_mode}")
            
            # 创建转换器
            converter = PixelArtConverter(file_path)
            
            # 调整图片尺寸
            converter.resize_image(max_size)
            
            # 减少颜色数量（如果指定）
            if color_count and color_count > 0:
                converter.reduce_colors(color_count)
            
            # 分析像素数据
            converter.analyze_pixels(numbering_mode)
            
            # 分析编号序列
            number_sequences, color_to_index = converter.analyze_number_sequences(numbering_mode)
            
            # 生成颜色统计
            color_stats = self._generate_color_stats(converter.pixel_data, color_to_index)
            
            # 生成编号统计
            number_stats = self._generate_number_stats(number_sequences)
            
            # 准备返回数据
            result = {
                "processing_params": {
                    "max_size": max_size,
                    "color_count": color_count,
                    "numbering_mode": numbering_mode,
                    "processed_dimensions": {
                        "width": converter.width,
                        "height": converter.height
                    }
                },
                "pixel_data": self._serialize_pixel_data(converter.pixel_data),
                "color_stats": color_stats,
                "number_stats": number_stats,
                "dimensions": {
                    "width": converter.width,
                    "height": converter.height
                }
            }
            
            self.logger.info(f"Image processing completed: {converter.width}x{converter.height}")
            return result
            
        except Exception as e:
            self.logger.error(f"Error processing image {file_path}: {e}")
            raise
    
    def _serialize_pixel_data(self, pixel_data: List[List[Dict]]) -> List[List[Dict]]:
        """序列化像素数据"""
        serialized = []
        for row in pixel_data:
            serialized_row = []
            for pixel in row:
                serialized_row.append({
                    "x": pixel["x"],
                    "y": pixel["y"],
                    "number": pixel["number"],  # 像素编号
                    "color": pixel["color"],
                    "hex": pixel["hex"]
                })
            serialized.append(serialized_row)
        return serialized
    
    def _generate_color_stats(self, pixel_data: List[List[Dict]], color_to_index: Dict) -> List[Dict]:
        """生成颜色统计"""
        color_stats = defaultdict(lambda: {"count": 0, "positions": []})
        
        for y, row in enumerate(pixel_data):
            for x, pixel in enumerate(row):
                color = pixel["color"]
                color_key = str(color)
                
                if color_key not in color_stats:
                    color_stats[color_key] = {
                        "color_index": color_to_index.get(color, 0),
                        "rgb": color,
                        "hex": pixel["hex"],
                        "count": 0,
                        "positions": []
                    }
                
                color_stats[color_key]["count"] += 1
                color_stats[color_key]["positions"].append([x, y])
        
        # 转换为列表并按使用次数排序
        stats_list = list(color_stats.values())
        stats_list.sort(key=lambda x: x["count"], reverse=True)
        
        return stats_list
    
    def _generate_number_stats(self, number_sequences: Dict) -> List[Dict]:
        """生成编号统计"""
        number_stats = []
        
        for number in sorted(number_sequences.keys()):
            sequence = number_sequences[number]
            number_stats.append({
                "number": number,
                "sequence": sequence
            })
        
        return number_stats
    
    def export_pixelated_image(self, pixel_data: List[List[Dict]], dimensions: Dict, pixel_size: int = 10, export_type: str = "png") -> str:
        """导出像素化图片"""
        try:
            width = dimensions["width"]
            height = dimensions["height"]
            
            # 创建新图片
            export_width = width * pixel_size
            export_height = height * pixel_size
            export_img = Image.new("RGB", (export_width, export_height), (255, 255, 255))
            
            # 绘制像素
            for y, row in enumerate(pixel_data):
                for x, pixel in enumerate(row):
                    color = pixel["color"]
                    # 确保颜色值是元组格式
                    if isinstance(color, list):
                        color = tuple(color)
                    elif not isinstance(color, tuple):
                        # 如果是其他格式，尝试转换为元组
                        color = tuple(color) if hasattr(color, '__iter__') else (0, 0, 0)
                    
                    pixel_x = x * pixel_size
                    pixel_y = y * pixel_size
                    
                    # 绘制像素块
                    for dy in range(pixel_size):
                        for dx in range(pixel_size):
                            export_img.putpixel((pixel_x + dx, pixel_y + dy), color)
            
            # 生成导出文件名
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            export_filename = f"pixelated_{timestamp}.{export_type}"
            export_path = os.path.join(settings.UPLOAD_DIR, export_filename)
            
            # 保存图片
            if export_type.lower() == "png":
                export_img.save(export_path, "PNG")
            elif export_type.lower() == "jpg":
                export_img.save(export_path, "JPEG", quality=95)
            else:
                export_img.save(export_path, "PNG")
            
            self.logger.info(f"Exported pixelated image: {export_path}")
            return export_filename
            
        except Exception as e:
            self.logger.error(f"Error exporting pixelated image: {e}")
            raise


class PixelArtConverter:
    """像素艺术转换器"""
    
    def __init__(self, image_path: str):
        """初始化图片转换器"""
        self.img = Image.open(image_path).convert("RGB")
        self.width, self.height = self.img.size
        self.pixel_data = []
        self.filename = os.path.splitext(os.path.basename(image_path))[0]
    
    def resize_image(self, max_dimension: int = 100):
        """调整图片尺寸"""
        if self.width > self.height:
            new_width = max_dimension
            new_height = int(self.height * (max_dimension / self.width))
        else:
            new_height = max_dimension
            new_width = int(self.width * (max_dimension / self.height))
        
        self.img = self.img.resize((new_width, new_height), Image.NEAREST)
        self.width, self.height = self.img.size
        logger.info(f"Image resized to: {self.width}×{self.height} pixels")
    
    def reduce_colors(self, n_colors: int):
        """使用K-means算法减少颜色数量"""
        logger.info(f"Reducing colors to {n_colors}...")
        img_array = np.array(self.img)
        h, w, c = img_array.shape
        pixel_samples = img_array.reshape(-1, 3)
        
        kmeans = KMeans(n_clusters=n_colors, random_state=0).fit(pixel_samples)
        new_colors = kmeans.cluster_centers_.astype(int)
        new_img_array = new_colors[kmeans.labels_].reshape(h, w, c)
        
        self.img = Image.fromarray(new_img_array.astype("uint8"))
        logger.info(f"Colors reduced to {n_colors}")
    
    def _calculate_number(self, x: int, y: int, mode: NumberingMode) -> int:
        """根据编号方式计算像素编号"""
        if mode == "top_to_bottom":
            # 从上到下，每行编号相同
            return y + 1
        elif mode == "bottom_to_top":
            # 从下到上，每行编号相同
            return self.height - y
        elif mode == "diagonal_bottom_left":
            # 从左下角开始沿着对角线
            return (self.height - 1 - y) + x + 1
        elif mode == "diagonal_bottom_right":
            # 从右下角开始沿着对角线（原有方式）
            return (self.width - 1 - x) + (self.height - 1 - y) + 1
        else:
            # 默认使用右下角对角线方式
            return (self.width - 1 - x) + (self.height - 1 - y) + 1
    
    def analyze_pixels(self, numbering_mode: NumberingMode = "diagonal_bottom_right"):
        """分析像素数据并生成编号"""
        self.pixel_data = []
        
        for y in range(self.height):
            row = []
            for x in range(self.width):
                r, g, b = self.img.getpixel((x, y))
                hex_color = f"#{r:02X}{g:02X}{b:02X}"
                
                # 根据编号方式计算编号
                number = self._calculate_number(x, y, numbering_mode)
                
                row.append({
                    "x": x,
                    "y": y,
                    "number": number,    # 像素编号
                    "color": (r, g, b),
                    "hex": hex_color,
                })
            self.pixel_data.append(row)
    
    def analyze_number_sequences(self, numbering_mode: NumberingMode = "diagonal_bottom_right"):
        """分析每个编号的连续颜色块序列"""
        number_sequences = {}
        
        # 获取颜色索引映射
        color_to_index = {}
        for row in self.pixel_data:
            for pixel in row:
                if pixel["color"] not in color_to_index:
                    color_to_index[pixel["color"]] = len(color_to_index) + 1
        
        # 根据编号方式确定编号数量
        if numbering_mode in ["diagonal_bottom_left", "diagonal_bottom_right"]:
            # 对角线方式：编号数量为 width + height - 1
            max_number = self.width + self.height - 1
        else:
            # 行列方式：使用行数作为编号数量
            max_number = self.height
        
        # 分析每个编号（从1开始）
        for number in range(1, max_number + 1):
            sequence = []
            
            # 收集该编号的所有像素
            number_pixels = []
            for y in range(self.height):
                for x in range(self.width):
                    pixel_number = self._calculate_number(x, y, numbering_mode)
                    if pixel_number == number:
                        number_pixels.append(self.pixel_data[y][x])
            
            # 根据编号方式排序像素
            # 奇数组号从右往左，偶数组号从左往右
            if number % 2 == 1:
                number_pixels.sort(key=lambda p: p["x"], reverse=True)
            else:
                number_pixels.sort(key=lambda p: p["x"])
            
            # 统计连续颜色块
            if number_pixels:
                current_color = color_to_index[number_pixels[0]["color"]]
                current_count = 1
                
                for i in range(1, len(number_pixels)):
                    pixel_color = color_to_index[number_pixels[i]["color"]]
                    
                    if pixel_color == current_color:
                        # 相同颜色，计数加1
                        current_count += 1
                    else:
                        # 不同颜色，保存当前块并开始新块
                        sequence.append((current_color, current_count))
                        current_color = pixel_color
                        current_count = 1
                
                # 保存最后一个颜色块
                sequence.append((current_color, current_count))
            
            number_sequences[number] = sequence
        
        return number_sequences, color_to_index


 