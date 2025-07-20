// API响应类型
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// 编号方式类型
export type NumberingMode = "top_to_bottom" | "bottom_to_top" | "diagonal_bottom_left" | "diagonal_bottom_right";

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
    numbering_mode?: NumberingMode;
}

// 像素数据
export interface PixelData {
    x: number;
    y: number;
    number: number;  // 像素编号
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

// 编号统计
export interface NumberStat {
    number: number;
    sequence: [number, number][];
}

// 图片处理结果
export interface ProcessResult {
    pixel_data: PixelData[][];
    color_stats: ColorStat[];
    number_stats: NumberStat[];
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
    dimensions: {
        width: number;
        height: number;
    };
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
    showNumbers?: boolean;
    onPixelClick?: (pixel: PixelData) => void;
    onPixelSizeChange?: (size: number) => void;
    onShowNumbersChange?: (show: boolean) => void;
    highlightedColor?: string;
    highlightedNumber?: number;
    onClearHighlights?: () => void;
}

export interface ParameterPanelProps {
    maxSize: number;
    colorCount?: number;
    numberingMode?: NumberingMode;
    onMaxSizeChange: (size: number) => void;
    onColorCountChange: (count: number | undefined) => void;
    onNumberingModeChange: (mode: NumberingMode) => void;
    onProcess: () => void;
    processing?: boolean;
    disabled?: boolean;
}

export interface ColorStatsProps {
    colorStats: ColorStat[];
    onColorClick?: (color: ColorStat) => void;
    highlightedColor?: string;
}

export interface NumberStatsProps {
    numberStats: NumberStat[];
    colorStats?: ColorStat[]; // 添加颜色统计用于颜色映射
    onNumberClick?: (number: NumberStat) => void;
    highlightedNumber?: number;
}

export interface HistoryPanelProps {
    onItemClick?: (item: HistoryItem) => void;
    onItemDelete?: (filename: string) => void;
    selectedItem?: string;
}

export interface StatsPanelProps {
    colorStats?: ColorStat[];
    numberStats?: NumberStat[];
    onColorClick?: (color: ColorStat) => void;
    onNumberClick?: (number: NumberStat) => void;
    highlightedColor?: string;
    highlightedNumber?: number;
    onHistoryItemClick?: (item: HistoryItem) => void;
    onHistoryItemDelete?: (filename: string) => void;
    selectedHistoryItem?: string;
}

export interface ExportPanelProps {
    pixelData: PixelData[][];
    dimensions: {
        width: number;
        height: number;
    };
    onExportPNG: (pixelSize?: number) => Promise<void>;
    onExportJPG: (pixelSize?: number) => Promise<void>;
    disabled?: boolean;
} 