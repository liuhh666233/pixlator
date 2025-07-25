import React from 'react';
import styled from 'styled-components';
import type { PixelGridProps } from '../../types';

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  width: 100%;
`;

const PixelGridWrapper = styled.div<{ width: number; height: number; pixelSize: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.width}, ${props => props.pixelSize}px);
  grid-template-rows: repeat(${props => props.height}, ${props => props.pixelSize}px);
  gap: 1px;
  background: #e0e0e0;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  margin: 0 auto;
  height: fit-content;
`;

const Pixel = styled.div<{
  color: string;
  highlighted: boolean;
  showNumbers: boolean;
}>`
  width: 100%;
  height: 100%;
  background-color: ${props => props.color};
  border: ${props => props.highlighted ? '2px solid #ff0000' : 'none'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: scale(1.1);
    z-index: 1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  ${props => props.showNumbers && `
    &::after {
      content: attr(data-number);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 8px;
      color: white;
      text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
      font-weight: bold;
      pointer-events: none;
    }
  `}
`;

const GridInfo = styled.div`
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
  justify-content: center;
  margin-bottom: 12px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoLabel = styled.span`
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: #2196f3;
  font-weight: 600;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  background: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
  justify-content: space-between;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlLabel = styled.label`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const SizeSlider = styled.input`
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
  appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #2196f3;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #2196f3;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const SizeValue = styled.span`
  min-width: 30px;
  text-align: center;
  font-weight: 600;
  color: #2196f3;
  font-size: 14px;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.active ? '#2196f3' : '#ddd'};
  background: ${props => props.active ? '#2196f3' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#1976d2' : '#f5f5f5'};
  }
`;

const PixelGrid: React.FC<PixelGridProps> = ({
  pixelData,
  dimensions,
  pixelSize = 16,
  showNumbers = false,
  onPixelClick,
  onPixelSizeChange,
  onShowNumbersChange,
  highlightedColor,
  highlightedNumber,
  onClearHighlights,
}) => {
  const handlePixelClick = (pixel: any) => {
    if (onPixelClick) {
      onPixelClick(pixel);
    }
  };

  const isPixelHighlighted = (pixel: any) => {
    if (highlightedColor && pixel.hex === highlightedColor) {
      return true;
    }
    if (highlightedNumber !== undefined && pixel.number === highlightedNumber) {
      return true;
    }
    return false;
  };

  if (!pixelData || pixelData.length === 0) {
    return (
      <GridContainer>
        <div style={{ color: '#999', textAlign: 'center' }}>
          暂无像素数据
        </div>
      </GridContainer>
    );
  }

  return (
    <>
      <Controls>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ControlGroup>
            <ControlLabel>像素大小:</ControlLabel>
            <SizeSlider
              type="range"
              min="4"
              max="32"
              value={pixelSize}
              onChange={(e) => onPixelSizeChange?.(parseInt(e.target.value))}
            />
            <SizeValue>{pixelSize}px</SizeValue>
          </ControlGroup>

          <ToggleButton
            active={showNumbers}
            onClick={() => onShowNumbersChange?.(!showNumbers)}
          >
            {showNumbers ? '隐藏' : '显示'}编号
          </ToggleButton>
        </div>

        {(highlightedColor || highlightedNumber !== null) && (
          <ToggleButton
            active={false}
            onClick={onClearHighlights}
          >
            清除高亮
          </ToggleButton>
        )}
      </Controls>

      <GridContainer>
        <GridInfo>
          <InfoItem>
            <InfoLabel>尺寸:</InfoLabel>
            <InfoValue>{dimensions.width} × {dimensions.height}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>像素总数:</InfoLabel>
            <InfoValue>{dimensions.width * dimensions.height}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>编号组数:</InfoLabel>
            <InfoValue>{Math.max(...pixelData.flat().map(p => p.number)) + 1}</InfoValue>
          </InfoItem>
        </GridInfo>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <PixelGridWrapper
            width={dimensions.width}
            height={dimensions.height}
            pixelSize={pixelSize}
          >
            {pixelData.map((row, y) =>
              row.map((pixel, x) => (
                <Pixel
                  key={`${x}-${y}`}
                  color={pixel.hex}
                  highlighted={isPixelHighlighted(pixel)}
                  showNumbers={showNumbers}
                  data-number={pixel.number}
                  onClick={() => handlePixelClick(pixel)}
                  title={`位置: (${x}, ${y}) | 编号: ${pixel.number} | 颜色: ${pixel.hex}`}
                />
              ))
            )}
          </PixelGridWrapper>
        </div>
      </GridContainer>
    </>
  );
};

export default PixelGrid; 