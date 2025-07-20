import React from 'react';
import styled from 'styled-components';
import type { ColorStatsProps } from '../../types';

const StatsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;



const ColorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  max-height: 70vh;
  min-height: 400px;
`;

const ColorBar = styled.div<{ highlighted: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 4px;
  background: ${props => props.highlighted ? '#e3f2fd' : 'transparent'};
  border: 2px solid ${props => props.highlighted ? '#2196f3' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 0;

  &:hover {
    background: #f0f8ff;
  }
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background-color: ${props => props.color};
  border: 1px solid #ddd;
  flex-shrink: 0;
`;

const ColorBarContainer = styled.div`
  flex: 1;
  height: 16px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
`;

const ColorBarFill = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: ${props => props.color};
  transition: width 0.3s ease;
`;

const ColorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex-shrink: 0;
`;

const ColorHex = styled.div`
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #333;
  font-size: 11px;
  min-width: 50px;
`;

const ColorPercent = styled.div`
  font-size: 10px;
  color: #666;
  min-width: 35px;
  text-align: right;
`;

const ColorCount = styled.div`
  font-size: 10px;
  color: #999;
  min-width: 40px;
  text-align: right;
`;



const EmptyState = styled.div`
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 14px;
`;

const ColorStats: React.FC<ColorStatsProps> = ({
  colorStats,
  onColorClick,
  highlightedColor,
}) => {
  const totalPixels = colorStats.reduce((sum, color) => sum + color.count, 0);

  const handleColorClick = (color: any) => {
    if (onColorClick) {
      onColorClick(color);
    }
  };

  if (!colorStats || colorStats.length === 0) {
    return (
      <StatsContainer>
        <EmptyState>
          暂无颜色数据
        </EmptyState>
      </StatsContainer>
    );
  }

  return (
    <StatsContainer>
      <ColorList>
        {colorStats.map((color) => {
          const percentage = ((color.count / totalPixels) * 100).toFixed(1);
          return (
            <ColorBar
              key={color.hex}
              highlighted={highlightedColor === color.hex}
              onClick={() => handleColorClick(color)}
              title={`点击高亮颜色 ${color.hex} (${percentage}%)`}
            >
              <ColorSwatch color={color.hex} />
              <ColorBarContainer>
                <ColorBarFill
                  width={parseFloat(percentage)}
                  color={color.hex}
                />
              </ColorBarContainer>
              <ColorInfo>
                <ColorHex>{color.hex}</ColorHex>
                <ColorPercent>{percentage}%</ColorPercent>
                <ColorCount>{color.count}</ColorCount>
              </ColorInfo>
            </ColorBar>
          );
        })}
      </ColorList>
    </StatsContainer>
  );
};

export default ColorStats; 