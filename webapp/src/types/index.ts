// API响应类型
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// 文件上传响应
export interface UploadResponse {
    file_id: string;
    filename: string;
    size: number;
    preview_url: string;
    dimensions: {
        width: number;
        height: number;
    };
}

// 图片处理请求参数
export interface ProcessRequest {
    file_id: string;
    max_size: number;
    color_count?: number;
}

// 像素数据
export interface PixelData {
    x: number;
    y: number;
    diagonal: number;
    color: [number, number, number];
    hex: string;
}

// 颜色统计
export interface ColorStat {
    color_index: number;
    rgb: [number, number, number];
    hex: string;
    count: number;
    positions: [number, number][];
}

// 对角线统计
export interface DiagonalStat {
    diagonal_num: number;
    sequence: [number, number][];
}

// 图片处理结果
export interface ProcessResult {
    pixel_data: PixelData[][];
    color_stats: ColorStat[];
    diagonal_stats: DiagonalStat[];
    dimensions: {
        width: number;
        height: number;
    };
}

// 历史记录项
export interface HistoryItem {
    filename: string;
    original_filename: string;
    upload_time: string;
    file_size: number;
    preview_url: string;
    has_processing_result?: boolean;
}

// 组件Props类型
export interface ImageUploaderProps {
    onUploadSuccess: (data: UploadResponse) => void;
    onUploadError: (error: string) => void;
    disabled?: boolean;
}

export interface PixelGridProps {
    pixelData: PixelData[][];
    dimensions: {
        width: number;
        height: number;
    };
    pixelSize?: number;
    showDiagonals?: boolean;
    onPixelClick?: (pixel: PixelData) => void;
    onPixelSizeChange?: (size: number) => void;
    onShowDiagonalsChange?: (show: boolean) => void;
    highlightedColor?: string;
    highlightedDiagonal?: number;
}

export interface ParameterPanelProps {
    maxSize: number;
    colorCount?: number;
    onMaxSizeChange: (size: number) => void;
    onColorCountChange: (count: number) => void;
    onProcess: () => void;
    processing?: boolean;
    disabled?: boolean;
}

export interface ColorStatsProps {
    colorStats: ColorStat[];
    onColorClick?: (color: ColorStat) => void;
    highlightedColor?: string;
}

export interface DiagonalStatsProps {
    diagonalStats: DiagonalStat[];
    onDiagonalClick?: (diagonal: DiagonalStat) => void;
    highlightedDiagonal?: number;
}

export interface HistoryPanelProps {
    history: HistoryItem[];
    onItemClick: (item: HistoryItem) => void;
    onItemDelete: (filename: string) => void;
    selectedItem?: string;
}

export interface ExportPanelProps {
    pixelData: PixelData[][];
    dimensions: {
        width: number;
        height: number;
    };
    onExportPNG: () => void;
    onExportSVG: () => void;
    disabled?: boolean;
} 