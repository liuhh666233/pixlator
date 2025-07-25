import React, { useState } from 'react';
import styled from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import ImageUploader from './components/ImageUploader';
import ParameterPanel from './components/ParameterPanel';
import PixelGrid from './components/PixelGrid/PixelGrid';
import StatsPanel from './components/StatsPanel/StatsPanel';
import ExportPanel from './components/ExportPanel';
import { processImage } from './services/api';
import { UploadResponse, ProcessResult, ColorStat, NumberStat, HistoryItem, NumberingMode } from './types';

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
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr minmax(320px, auto);
  gap: 30px;
  justify-content: center;
  
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

const CenterPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
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
    const [numberingMode, setNumberingMode] = useState<NumberingMode>('diagonal_bottom_right');
    const [processing, setProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [showNumbers, setShowNumbers] = useState(false);
    const [pixelSize, setPixelSize] = useState(16);
    const [highlightedColor, setHighlightedColor] = useState<string | null>(null);
    const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(null);

    const handleUploadSuccess = (data: UploadResponse) => {
        setUploadedFile(data);
        setStatusMessage({ type: 'success', text: `图片上传成功: ${data.filename}` });
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
            // 调用真实的图片处理API
            const result = await processImage({
                file_id: uploadedFile.file_id,
                max_size: maxSize,
                color_count: colorCount,
                numbering_mode: numberingMode,
            });

            setProcessingResult(result);
            setStatusMessage({ type: 'success', text: '图片处理完成！' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '处理失败，请重试';
            setStatusMessage({ type: 'error', text: errorMessage });
        } finally {
            setProcessing(false);
        }
    };

    const clearStatus = () => {
        setStatusMessage(null);
    };

    const handleColorClick = (color: ColorStat) => {
        setHighlightedColor(color.hex);
        setHighlightedNumber(null);
    };

    const handleNumberClick = (number: NumberStat) => {
        setHighlightedNumber(number.number);
        setHighlightedColor(null);
    };

    const handlePixelClick = (pixel: any) => {
        console.log('Pixel clicked:', pixel);
    };

    const clearHighlights = () => {
        setHighlightedColor(null);
        setHighlightedNumber(null);
    };

    const handleHistoryItemClick = async (item: HistoryItem) => {
        setSelectedHistoryItem(item.filename);

        // 加载历史记录的处理结果
        try {
            const response = await fetch(`/api/history/${item.filename}`);
            const result = await response.json();

            if (result.success) {
                setProcessingResult(result.data);
                setUploadedFile({
                    file_id: item.filename,
                    filename: item.original_filename,
                    size: item.file_size,
                    preview_url: item.preview_url,
                    dimensions: item.dimensions
                });
                setStatusMessage({ type: 'success', text: `已加载历史记录: ${item.original_filename}` });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: '加载历史记录失败' });
        }
    };

    const handleHistoryItemDelete = async (filename: string) => {
        try {
            const response = await fetch(`/api/files/${filename}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // 如果删除的是当前选中的项目，清除选择
                if (selectedHistoryItem === filename) {
                    setSelectedHistoryItem(null);
                    setProcessingResult(null);
                    setUploadedFile(null);
                }
                setStatusMessage({ type: 'success', text: '历史记录已删除' });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: '删除历史记录失败' });
        }
    };

    const handleExportPNG = async (pixelSize: number = 16) => {
        if (!uploadedFile || !processingResult) {
            setStatusMessage({ type: 'error', text: '没有可导出的数据' });
            return;
        }

        try {
            setStatusMessage({ type: 'info', text: '正在导出PNG...' });

            const formData = new FormData();
            formData.append('export_type', 'png');
            formData.append('pixel_size', pixelSize.toString());

            const response = await fetch(`/api/export/${uploadedFile.file_id}`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                // 触发下载
                const downloadUrl = result.data.download_url;
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = result.data.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setStatusMessage({ type: 'success', text: 'PNG导出成功！' });
            } else {
                setStatusMessage({ type: 'error', text: '导出失败' });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: '导出失败，请重试' });
        }
    };

    const handleExportJPG = async (pixelSize: number = 16) => {
        if (!uploadedFile || !processingResult) {
            setStatusMessage({ type: 'error', text: '没有可导出的数据' });
            return;
        }

        try {
            setStatusMessage({ type: 'info', text: '正在导出JPG...' });

            const formData = new FormData();
            formData.append('export_type', 'jpg');
            formData.append('pixel_size', pixelSize.toString());

            const response = await fetch(`/api/export/${uploadedFile.file_id}`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                // 触发下载
                const downloadUrl = result.data.download_url;
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = result.data.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setStatusMessage({ type: 'success', text: 'JPG导出成功！' });
            } else {
                setStatusMessage({ type: 'error', text: '导出失败' });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: '导出失败，请重试' });
        }
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
                            numberingMode={numberingMode}
                            onMaxSizeChange={setMaxSize}
                            onColorCountChange={setColorCount}
                            onNumberingModeChange={setNumberingMode}
                            onProcess={handleProcess}
                            processing={processing}
                            disabled={!uploadedFile}
                        />

                        {processingResult && (
                            <ExportPanel
                                pixelData={processingResult.pixel_data}
                                dimensions={processingResult.dimensions}
                                onExportPNG={handleExportPNG}
                                onExportJPG={handleExportJPG}
                                disabled={processing}
                            />
                        )}
                    </LeftPanel>

                    <CenterPanel>
                        {processing ? (
                            <Placeholder>
                                <div>正在处理图片...</div>
                                <div style={{ marginTop: '16px' }} className="loading"></div>
                            </Placeholder>
                        ) : processingResult ? (
                            <>
                                <PixelGrid
                                    pixelData={processingResult.pixel_data}
                                    dimensions={processingResult.dimensions}
                                    pixelSize={pixelSize}
                                    showNumbers={showNumbers}
                                    onPixelClick={handlePixelClick}
                                    onPixelSizeChange={setPixelSize}
                                    onShowNumbersChange={setShowNumbers}
                                    highlightedColor={highlightedColor || undefined}
                                    highlightedNumber={highlightedNumber || undefined}
                                    onClearHighlights={clearHighlights}
                                />
                            </>
                        ) : uploadedFile ? (
                            <div style={{ background: 'white', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
                                <h3>已上传图片</h3>
                                <p>文件名: {uploadedFile.filename}</p>
                                <p>尺寸: {uploadedFile.dimensions.width} × {uploadedFile.dimensions.height}</p>
                                <p>大小: {(uploadedFile.size / 1024).toFixed(1)} KB</p>
                                <p>请设置参数并点击"开始处理"</p>
                            </div>
                        ) : (
                            <Placeholder>
                                请上传图片开始处理
                            </Placeholder>
                        )}
                    </CenterPanel>

                    <StatsPanel
                        colorStats={processingResult?.color_stats || []}
                        numberStats={processingResult?.number_stats || []}
                        onColorClick={handleColorClick}
                        onNumberClick={handleNumberClick}
                        highlightedColor={highlightedColor || undefined}
                        highlightedNumber={highlightedNumber || undefined}
                        onHistoryItemClick={handleHistoryItemClick}
                        onHistoryItemDelete={handleHistoryItemDelete}
                        selectedHistoryItem={selectedHistoryItem || undefined}
                    />
                </MainContent>


            </AppContainer>
        </>
    );
};

export default App; 