from pydantic import BaseModel
from typing import List, Tuple, Dict, Optional
from enum import Enum


class ImageFormat(str, Enum):
    JPG = "jpg"
    PNG = "png"
    GIF = "gif"
    BMP = "bmp"


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


class PixelData(BaseModel):
    x: int
    y: int
    diagonal: int
    color: Tuple[int, int, int]
    hex: str


class ColorStat(BaseModel):
    color_index: int
    rgb: Tuple[int, int, int]
    hex: str
    count: int
    positions: List[Tuple[int, int]]


class DiagonalStat(BaseModel):
    diagonal_num: int
    sequence: List[Tuple[int, int]]  # (color_index, count)


class ProcessResponse(BaseModel):
    pixel_data: List[List[PixelData]]
    color_stats: List[ColorStat]
    diagonal_stats: List[DiagonalStat]
    dimensions: Dict[str, int]


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None 