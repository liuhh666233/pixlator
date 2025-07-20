import React from 'react';
import styled from 'styled-components';
import type { ParameterPanelProps, NumberingMode } from '../../types';

const Panel = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Title = styled.h3`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
`;

const ParameterGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  font-size: 14px;
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
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #2196f3;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
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
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: #2196f3;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    border-color: #2196f3;
    outline: none;
  }
`;

const ProcessButton = styled.button<{ processing: boolean; disabled: boolean }>`
  width: 100%;
  padding: 12px 24px;
  background-color: ${props => props.processing ? '#ccc' : '#2196f3'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled || props.processing ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover {
    background-color: ${props => props.processing || props.disabled ? '#ccc' : '#1976d2'};
  }

  &:active {
    transform: ${props => props.processing || props.disabled ? 'none' : 'translateY(1px)'};
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ParameterPanel: React.FC<ParameterPanelProps> = ({
  maxSize,
  colorCount,
  numberingMode,
  onMaxSizeChange,
  onColorCountChange,
  onNumberingModeChange,
  onProcess,
  processing = false,
  disabled = false,
}) => {
  const handleMaxSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onMaxSizeChange(value);
  };

  const handleColorCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === 'auto' ? undefined : parseInt(e.target.value);
    onColorCountChange(value);
  };

  const handleNumberingModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as NumberingMode;
    onNumberingModeChange(value);
  };

  const handleProcess = () => {
    if (!disabled && !processing) {
      onProcess();
    }
  };

  return (
    <Panel>
      <Title>处理参数</Title>

      <ParameterGroup>
        <Label>最大尺寸: {maxSize}px</Label>
        <SliderContainer>
          <Slider
            type="range"
            min="10"
            max="200"
            value={maxSize}
            onChange={handleMaxSizeChange}
            disabled={disabled}
          />
          <Value>{maxSize}</Value>
        </SliderContainer>
      </ParameterGroup>

      <ParameterGroup>
        <Label>颜色数量</Label>
        <Select
          value={colorCount || 'auto'}
          onChange={handleColorCountChange}
          disabled={disabled}
        >
          <option value="auto">自动检测</option>
          <option value="2">2 色</option>
          <option value="4">4 色</option>
          <option value="8">8 色</option>
          <option value="16">16 色</option>
          <option value="32">32 色</option>
          <option value="64">64 色</option>
        </Select>
      </ParameterGroup>

      <ParameterGroup>
        <Label>编号方式</Label>
        <Select
          value={numberingMode}
          onChange={handleNumberingModeChange}
          disabled={disabled}
        >
          <option value="diagonal_bottom_right">右下角对角线</option>
          <option value="diagonal_bottom_left">左下角对角线</option>
          <option value="top_to_bottom">从上到下</option>
          <option value="bottom_to_top">从下到上</option>
        </Select>
      </ParameterGroup>

      <ProcessButton
        onClick={handleProcess}
        processing={processing}
        disabled={disabled}
      >
        <ButtonContent>
          {processing && <LoadingSpinner />}
          {processing ? '处理中...' : '开始处理'}
        </ButtonContent>
      </ProcessButton>
    </Panel>
  );
};

export default ParameterPanel; 