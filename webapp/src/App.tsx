import React, { useState } from 'react';
import styled from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import ImageUploader from './components/ImageUploader';
import ParameterPanel from './components/ParameterPanel';
import { UploadResponse, ProcessResult } from './types';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: #333;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
  margin: 0;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightPanel = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Placeholder = styled.div`
  text-align: center;
  color: #999;
  font-size: 16px;
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
  
  ${props => {
        switch (props.type) {
            case 'success':
                return `
          background-color: #e8f5e8;
          color: #2e7d32;
          border: 1px solid #c8e6c9;
        `;
            case 'error':
                return `
          background-color: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
        `;
            case 'info':
                return `
          background-color: #e3f2fd;
          color: #1565c0;
          border: 1px solid #bbdefb;
        `;
        }
    }}
`;

const App: React.FC = () => {
    const [uploadedFile, setUploadedFile] = useState<UploadResponse | null>(null);
    const [processingResult, setProcessingResult] = useState<ProcessResult | null>(null);
    const [maxSize, setMaxSize] = useState(50);
    const [colorCount, setColorCount] = useState<number | undefined>(undefined);
    const [processing, setProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

    const handleUploadSuccess = (data: UploadResponse) => {
        setUploadedFile(data);
        setStatusMessage({ type: 'success', text: `图片上传成功: ${data.original_filename}` });
        setProcessingResult(null); // 清除之前的结果
    };

    const handleUploadError = (error: string) => {
        setStatusMessage({ type: 'error', text: error });
    };

    const handleProcess = async () => {
        if (!uploadedFile) {
            setStatusMessage({ type: 'error', text: '请先上传图片' });
            return;
        }

        setProcessing(true);
        setStatusMessage({ type: 'info', text: '正在处理图片...' });

        try {
            // 模拟处理过程
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 模拟处理结果
            const mockResult: ProcessResult = {
                pixel_data: Array.from({ length: Math.floor(maxSize * 0.8) }, (_, y) =>
                    Array.from({ length: maxSize }, (_, x) => ({
                        x,
                        y,
                        diagonal: x + y,
                        color: [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)] as [number, number, number],
                        hex: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
                    }))
                ),
                color_stats: Array.from({ length: colorCount || 8 }, (_, i) => ({
                    color_index: i,
                    rgb: [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)] as [number, number, number],
                    hex: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
                    count: Math.floor(Math.random() * 100) + 10,
                    positions: [],
                })),
                diagonal_stats: Array.from({ length: 10 }, (_, i) => ({
                    diagonal_num: i,
                    sequence: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => [
                        Math.floor(Math.random() * 10),
                        Math.floor(Math.random() * 10),
                    ] as [number, number]),
                })),
                dimensions: {
                    width: maxSize,
                    height: Math.floor(maxSize * 0.8),
                },
            };

            setProcessingResult(mockResult);
            setStatusMessage({ type: 'success', text: '图片处理完成！' });
        } catch (error) {
            setStatusMessage({ type: 'error', text: '处理失败，请重试' });
        } finally {
            setProcessing(false);
        }
    };

    const clearStatus = () => {
        setStatusMessage(null);
    };

    return (
        <>
            <GlobalStyles />
            <AppContainer>
                <Header>
                    <Title>Pixlator</Title>
                    <Subtitle>图片像素化处理工具</Subtitle>
                </Header>

                <MainContent>
                    <LeftPanel>
                        {statusMessage && (
                            <StatusMessage type={statusMessage.type}>
                                {statusMessage.text}
                                <button onClick={clearStatus} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                            </StatusMessage>
                        )}

                        <ImageUploader
                            onUploadSuccess={handleUploadSuccess}
                            onUploadError={handleUploadError}
                            disabled={processing}
                        />

                        <ParameterPanel
                            maxSize={maxSize}
                            colorCount={colorCount}
                            onMaxSizeChange={setMaxSize}
                            onColorCountChange={setColorCount}
                            onProcess={handleProcess}
                            processing={processing}
                            disabled={!uploadedFile}
                        />
                    </LeftPanel>

                    <RightPanel>
                        {processing ? (
                            <Placeholder>
                                <div>正在处理图片...</div>
                                <div style={{ marginTop: '16px' }} className="loading"></div>
                            </Placeholder>
                        ) : processingResult ? (
                            <div>
                                <h3>处理结果</h3>
                                <p>尺寸: {processingResult.dimensions.width} × {processingResult.dimensions.height}</p>
                                <p>颜色数量: {processingResult.color_stats.length}</p>
                                <p>对角线数量: {processingResult.diagonal_stats.length}</p>
                                {/* 这里将来会显示像素网格 */}
                            </div>
                        ) : uploadedFile ? (
                            <div>
                                <h3>已上传图片</h3>
                                <p>文件名: {uploadedFile.original_filename}</p>
                                <p>尺寸: {uploadedFile.dimensions.width} × {uploadedFile.dimensions.height}</p>
                                <p>大小: {(uploadedFile.file_size / 1024).toFixed(1)} KB</p>
                                <p>请设置参数并点击"开始处理"</p>
                            </div>
                        ) : (
                            <Placeholder>
                                请上传图片开始处理
                            </Placeholder>
                        )}
                    </RightPanel>
                </MainContent>
            </AppContainer>
        </>
    );
};

export default App; 