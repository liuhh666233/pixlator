import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { uploadImage } from '../../services/api';
import type { ImageUploaderProps } from '../../types';

const UploadContainer = styled.div<{ isDragActive: boolean; disabled: boolean }>`
  border: 2px dashed ${props => props.isDragActive ? '#2196f3' : '#ccc'};
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  background-color: ${props => props.isDragActive ? '#f0f8ff' : '#fafafa'};
  transition: all 0.3s ease;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover {
    border-color: ${props => props.disabled ? '#ccc' : '#2196f3'};
    background-color: ${props => props.disabled ? '#fafafa' : '#f0f8ff'};
  }
`;

const UploadIcon = styled.div`
  font-size: 48px;
  color: #666;
  margin-bottom: 16px;
`;

const UploadText = styled.div`
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
`;

const UploadSubtext = styled.div`
  font-size: 14px;
  color: #999;
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  margin-top: 16px;
  overflow: hidden;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.progress}%;
    background-color: #2196f3;
    transition: width 0.3s ease;
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 14px;
  margin-top: 8px;
`;

const ImageUploader: React.FC<ImageUploaderProps> = ({
    onUploadSuccess,
    onUploadError,
    disabled = false,
}) => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (disabled) return;

        const file = acceptedFiles[0];
        if (!file) return;

        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
        if (!allowedTypes.includes(file.type)) {
            const errorMsg = '不支持的文件类型。请上传 JPG, PNG, GIF 或 BMP 格式的图片。';
            setError(errorMsg);
            onUploadError(errorMsg);
            return;
        }

        // 验证文件大小 (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            const errorMsg = '文件大小不能超过 10MB。';
            setError(errorMsg);
            onUploadError(errorMsg);
            return;
        }

        setError(null);
        setUploadProgress(0);

        try {
            // 模拟上传进度
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            // 调用实际的API上传
            const result = await uploadImage(file);

            clearInterval(progressInterval);
            setUploadProgress(100);

            onUploadSuccess(result);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : '上传失败';
            setError(errorMsg);
            onUploadError(errorMsg);
        } finally {
            setUploadProgress(0);
        }
    }, [disabled, onUploadSuccess, onUploadError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
        },
        multiple: false,
        disabled,
    });

    return (
        <UploadContainer
            {...getRootProps()}
            isDragActive={isDragActive}
            disabled={disabled}
        >
            <input {...getInputProps()} />

            <UploadIcon>
                {isDragActive ? '📁' : '📤'}
            </UploadIcon>

            <UploadText>
                {isDragActive
                    ? '释放文件以上传'
                    : '拖拽图片到此处，或点击选择文件'
                }
            </UploadText>

            <UploadSubtext>
                支持 JPG, PNG, GIF, BMP 格式，最大 10MB
            </UploadSubtext>

            {uploadProgress > 0 && (
                <ProgressBar progress={uploadProgress} />
            )}

            {error && (
                <ErrorMessage>{error}</ErrorMessage>
            )}
        </UploadContainer>
    );
};

export default ImageUploader; 