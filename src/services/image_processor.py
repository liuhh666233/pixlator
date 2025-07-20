import os
from typing import List, Dict, Tuple, Optional
from PIL import Image
import numpy as np
from sklearn.cluster import KMeans
from collections import defaultdict
from loguru import logger

from config import settings

class ImageProcessor:
    """图片处理服务"""
    
    def __init__(self):
        self.logger = logger
    
    def process_image(self, file_path: str, max_size: int = None, color_count: int = None) -> Dict:
        """处理图片并返回像素化结果"""
        try:
            if max_size is None:
                max_size = settings.DEFAULT_MAX_SIZE
            if color_count is None:
                color_count = settings.DEFAULT_COLOR_COUNT
            
            self.logger.info(f"Processing image: {file_path} with max_size={max_size}, color_count={color_count}")
            
            # 创建转换器
            converter = DiagonalPixelArtConverter(file_path)
            
            # 调整图片尺寸
            converter.resize_image(max_size)
            
            # 减少颜色数量（如果指定）
            if color_count and color_count > 0:
                converter.reduce_colors(color_count)
            
            # 分析像素数据
            converter.analyze_pixels()
            
            # 分析对角线序列
            diagonal_sequences, color_to_index = converter.analyze_diagonal_sequences()
            
            # 生成颜色统计
            color_stats = self._generate_color_stats(converter.pixel_data, color_to_index)
            
            # 生成对角线统计
            diagonal_stats = self._generate_diagonal_stats(diagonal_sequences)
            
            # 准备返回数据
            result = {
                "processing_params": {
                    "max_size": max_size,
                    "color_count": color_count,
                    "processed_dimensions": {
                        "width": converter.width,
                        "height": converter.height
                    }
                },
                "pixel_data": self._serialize_pixel_data(converter.pixel_data),
                "color_stats": color_stats,
                "diagonal_stats": diagonal_stats,
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
                    "diagonal": pixel["diagonal"],
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
    
    def _generate_diagonal_stats(self, diagonal_sequences: Dict) -> List[Dict]:
        """生成对角线统计"""
        diagonal_stats = []
        
        for diagonal_num in sorted(diagonal_sequences.keys()):
            sequence = diagonal_sequences[diagonal_num]
            diagonal_stats.append({
                "diagonal_num": diagonal_num,
                "sequence": sequence
            })
        
        return diagonal_stats


class DiagonalPixelArtConverter:
    """对角线像素艺术转换器（从原有代码移植）"""
    
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
    
    def analyze_pixels(self):
        """分析像素数据并生成对角线编号（从右下角开始）"""
        self.pixel_data = []
        
        for y in range(self.height):
            row = []
            for x in range(self.width):
                r, g, b = self.img.getpixel((x, y))
                hex_color = f"#{r:02X}{g:02X}{b:02X}"
                
                # 对角线编号：从右下角(0)开始，向左上方递增
                diagonal_num = (self.width - 1 - x) + (self.height - 1 - y)
                
                row.append({
                    "x": x,
                    "y": y,
                    "diagonal": diagonal_num,
                    "color": (r, g, b),
                    "hex": hex_color,
                })
            self.pixel_data.append(row)
    
    def analyze_diagonal_sequences(self):
        """分析每个对角线的连续颜色块序列"""
        diagonal_sequences = {}
        
        # 获取颜色索引映射
        color_to_index = {}
        for row in self.pixel_data:
            for pixel in row:
                if pixel["color"] not in color_to_index:
                    color_to_index[pixel["color"]] = len(color_to_index) + 1
        
        # 分析每个对角线
        for diagonal_num in range(self.width + self.height - 1):
            sequence = []
            
            # 收集该对角线上的所有像素
            diagonal_pixels = []
            for y in range(self.height):
                for x in range(self.width):
                    if (self.width - 1 - x) + (self.height - 1 - y) == diagonal_num:
                        diagonal_pixels.append(self.pixel_data[y][x])
            
            # 按x坐标排序（从左到右）
            diagonal_pixels.sort(key=lambda p: p["x"])
            
            # 统计连续颜色块
            if diagonal_pixels:
                current_color = color_to_index[diagonal_pixels[0]["color"]]
                current_count = 1
                
                for i in range(1, len(diagonal_pixels)):
                    pixel_color = color_to_index[diagonal_pixels[i]["color"]]
                    
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
            
            diagonal_sequences[diagonal_num] = sequence
        
        return diagonal_sequences, color_to_index


 