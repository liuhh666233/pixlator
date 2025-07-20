import React from 'react';
import styled from 'styled-components';
import type { ColorStatsProps } from '../../types';

const StatsContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
`;

const ColorList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
`;

const ColorBar = styled.div<{ highlighted: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  background: ${props => props.highlighted ? '#e3f2fd' : 'transparent'};
  border: 2px solid ${props => props.highlighted ? '#2196f3' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f8ff;
  }
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 3px;
  background-color: ${props => props.color};
  border: 1px solid #ddd;
  flex-shrink: 0;
`;

const ColorBarContainer = styled.div`
  flex: 1;
  height: 24px;
  background: #f0f0f0;
  border-radius: 3px;
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
  gap: 8px;
  min-width: 0;
`;

const ColorHex = styled.div`
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #333;
  font-size: 12px;
  min-width: 60px;
`;

const ColorPercent = styled.div`
  font-size: 11px;
  color: #666;
  min-width: 40px;
  text-align: right;
`;

const ColorCount = styled.div`
  font-size: 11px;
  color: #999;
  min-width: 50px;
  text-align: right;
`;

const Summary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  font-size: 14px;
  color: #666;
`;

const TotalPixels = styled.span`
  font-weight: 600;
  color: #2196f3;
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
        <Title>颜色统计</Title>
        <EmptyState>
          暂无颜色数据
        </EmptyState>
      </StatsContainer>
    );
  }

  return (
    <StatsContainer>
      <Title>颜色统计 ({colorStats.length} 种颜色)</Title>

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

      <Summary>
        <span>总像素数:</span>
        <TotalPixels>{totalPixels}</TotalPixels>
      </Summary>
    </StatsContainer>
  );
};

export default ColorStats; 