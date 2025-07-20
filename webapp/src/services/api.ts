import axios from 'axios';
import type {
    ApiResponse,
    UploadResponse,
    ProcessRequest,
    ProcessResult,
    HistoryItem,
} from '../types';

// 创建axios实例
const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
api.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('API Response Error:', error);
        return Promise.reject(error);
    }
);

// API函数
export const uploadImage = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const processImage = async (params: ProcessRequest): Promise<ProcessResult> => {
    const response = await api.post<ProcessResult>('/process', params);
    return response.data;
};

export const getHistory = async (): Promise<HistoryItem[]> => {
    const response = await api.get<ApiResponse<HistoryItem[]>>('/history');

    if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get history');
    }

    return response.data.data!;
};

export const getProcessingResult = async (filename: string): Promise<ProcessResult> => {
    const response = await api.get<ApiResponse<ProcessResult>>(`/stats/${filename}`);

    if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get processing result');
    }

    return response.data.data!;
};

export const deleteFile = async (filename: string): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/files/${filename}`);

    if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete file');
    }
};

export const getImagePreview = (filename: string): string => {
    return `/api/preview/${filename}`;
};

export default api; 