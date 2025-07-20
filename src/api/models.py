from pydantic import BaseModel
from typing import List, Tuple, Dict, Optional, Literal
from enum import Enum


class ImageFormat(str, Enum):
    JPG = "jpg"
    PNG = "png"
    GIF = "gif"
    BMP = "bmp"


# 定义编号方式类型
NumberingMode = Literal["top_to_bottom", "bottom_to_top", "diagonal_bottom_left", "diagonal_bottom_right"]


class UploadResponse(BaseModel):
    file_id: str
    filename: str
    size: int
    preview_url: str
    dimensions: Dict[str, int]


class ProcessRequest(BaseModel):
    file_id: str
    max_size: int = 100
    color_count: Optional[int] = None
    numbering_mode: NumberingMode = "diagonal_bottom_right"


class PixelData(BaseModel):
    x: int
    y: int
    number: int  # 像素编号
    color: Tuple[int, int, int]
    hex: str


class ColorStat(BaseModel):
    color_index: int
    rgb: Tuple[int, int, int]
    hex: str
    count: int
    positions: List[Tuple[int, int]]


class NumberStat(BaseModel):
    number: int
    sequence: List[Tuple[int, int]]  # (color_index, count)


class ProcessResponse(BaseModel):
    pixel_data: List[List[PixelData]]
    color_stats: List[ColorStat]
    number_stats: List[NumberStat]
    dimensions: Dict[str, int]


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None 