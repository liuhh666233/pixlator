import React, { useState } from 'react';
import styled from 'styled-components';
import type { ExportPanelProps } from '../../types';

const Panel = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Title = styled.h3`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
`;

const ExportOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #555;
  font-weight: 500;
`;

const FormatSelector = styled.div`
  display: flex;
  gap: 8px;
`;

const FormatButton = styled.button<{ selected: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border: 2px solid ${props => props.selected ? '#2196f3' : '#ddd'};
  background: ${props => props.selected ? '#e3f2fd' : 'white'};
  color: ${props => props.selected ? '#2196f3' : '#666'};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.selected ? '#2196f3' : '#2196f3'};
    background: ${props => props.selected ? '#e3f2fd' : '#f0f8ff'};
  }
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Slider = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
  appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #2196f3;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #2196f3;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Value = styled.span`
  min-width: 35px;
  text-align: center;
  font-weight: 600;
  color: #2196f3;
  font-size: 13px;
`;

const ExportButton = styled.button<{ disabled: boolean; exporting: boolean }>`
  width: 100%;
  padding: 12px 20px;
  background-color: ${props => props.exporting ? '#ccc' : props.disabled ? '#f5f5f5' : '#2196f3'};
  color: ${props => props.disabled ? '#999' : 'white'};
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled || props.exporting ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover {
    background-color: ${props => props.exporting || props.disabled ? '#ccc' : '#1976d2'};
  }

  &:active {
    transform: ${props => props.exporting || props.disabled ? 'none' : 'translateY(1px)'};
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const LoadingSpinner = styled.div`
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PreviewInfo = styled.div`
  background: #f8f9fa;
  border-radius: 4px;
  padding: 12px;
  margin-top: 12px;
  font-size: 12px;
  color: #666;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: #555;
`;

const InfoValue = styled.span`
  color: #2196f3;
  font-weight: 600;
`;

type ExportFormat = 'png' | 'jpg';

const ExportPanel: React.FC<ExportPanelProps> = ({
  dimensions,
  onExportPNG,
  onExportJPG,
  disabled = false,
}) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [pixelSize, setPixelSize] = useState(16);
  const [exporting, setExporting] = useState(false);

  const handleFormatChange = (format: ExportFormat) => {
    setExportFormat(format);
  };

  const handlePixelSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setPixelSize(value);
  };

  const handleExport = async () => {
    if (disabled || exporting) return;

    setExporting(true);
    try {
      if (exportFormat === 'png') {
        await onExportPNG(pixelSize);
      } else {
        await onExportJPG(pixelSize);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  // 计算预览信息
  const exportWidth = dimensions.width * pixelSize;
  const exportHeight = dimensions.height * pixelSize;
  const totalPixels = dimensions.width * dimensions.height;

  return (
    <Panel>
      <Title>导出设置</Title>

      <ExportOptions>
        <OptionGroup>
          <Label>导出格式</Label>
          <FormatSelector>
            <FormatButton
              selected={exportFormat === 'png'}
              onClick={() => handleFormatChange('png')}
            >
              PNG
            </FormatButton>
            <FormatButton
              selected={exportFormat === 'jpg'}
              onClick={() => handleFormatChange('jpg')}
            >
              JPG
            </FormatButton>
          </FormatSelector>
        </OptionGroup>

        <OptionGroup>
          <Label>像素大小: {pixelSize}px</Label>
          <SliderContainer>
            <Slider
              type="range"
              min="4"
              max="32"
              value={pixelSize}
              onChange={handlePixelSizeChange}
              disabled={disabled}
            />
            <Value>{pixelSize}</Value>
          </SliderContainer>
        </OptionGroup>

        <ExportButton
          onClick={handleExport}
          disabled={disabled}
          exporting={exporting}
        >
          <ButtonContent>
            {exporting && <LoadingSpinner />}
            {exporting ? '导出中...' : `导出 ${exportFormat.toUpperCase()}`}
          </ButtonContent>
        </ExportButton>

        <PreviewInfo>
          <InfoRow>
            <InfoLabel>导出尺寸</InfoLabel>
            <InfoValue>{exportWidth} × {exportHeight}px</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>像素数量</InfoLabel>
            <InfoValue>{totalPixels}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>文件格式</InfoLabel>
            <InfoValue>{exportFormat.toUpperCase()}</InfoValue>
          </InfoRow>
        </PreviewInfo>
      </ExportOptions>
    </Panel>
  );
};

export default ExportPanel; 