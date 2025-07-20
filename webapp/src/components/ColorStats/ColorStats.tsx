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
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
`;

const ColorItem = styled.div<{ highlighted: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  background: ${props => props.highlighted ? '#e3f2fd' : '#f8f9fa'};
  border: 2px solid ${props => props.highlighted ? '#2196f3' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e3f2fd;
    transform: translateX(4px);
  }
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border: 1px solid #ddd;
  flex-shrink: 0;
`;

const ColorInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ColorHex = styled.div`
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #333;
  font-size: 14px;
  margin-bottom: 4px;
`;

const ColorRGB = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const ColorCount = styled.div`
  font-size: 12px;
  color: #999;
`;

const ColorIndex = styled.div`
  font-size: 12px;
  color: #2196f3;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
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
                {colorStats.map((color) => (
                    <ColorItem
                        key={color.hex}
                        highlighted={highlightedColor === color.hex}
                        onClick={() => handleColorClick(color)}
                        title={`点击高亮颜色 ${color.hex}`}
                    >
                        <ColorSwatch color={color.hex} />
                        <ColorInfo>
                            <ColorHex>{color.hex}</ColorHex>
                            <ColorRGB>RGB({color.rgb.join(', ')})</ColorRGB>
                            <ColorCount>{color.count} 个像素</ColorCount>
                        </ColorInfo>
                        <ColorIndex>#{color.color_index}</ColorIndex>
                    </ColorItem>
                ))}
            </ColorList>

            <Summary>
                <span>总像素数:</span>
                <TotalPixels>{totalPixels}</TotalPixels>
            </Summary>
        </StatsContainer>
    );
};

export default ColorStats; 