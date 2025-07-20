import React from 'react';
import styled from 'styled-components';
import type { DiagonalStatsProps } from '../../types';

const StatsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;



const DiagonalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  max-height: 70vh;
  min-height: 400px;
`;

const DiagonalItem = styled.div<{ highlighted: boolean }>`
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

const DiagonalNumber = styled.div`
  font-weight: 600;
  color: #2196f3;
  font-size: 11px;
  min-width: 35px;
  flex-shrink: 0;
`;

const SequenceContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 1px;
  align-items: center;
  overflow-x: auto;
  min-width: 0;
  flex: 1;
`;

const SequenceItem = styled.div<{ color: string; count: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  background-color: ${props => props.color};
  border-radius: 2px;
  font-size: 10px;
  color: white;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
  font-weight: bold;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    z-index: 1;
  }

  /* 显示数字在色块内 */
  &::after {
    content: '${props => props.count}';
    color: white;
    font-size: 9px;
    font-weight: bold;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
  }
`;



const EmptyState = styled.div`
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 14px;
`;



const DiagonalStats: React.FC<DiagonalStatsProps> = ({
  diagonalStats,
  colorStats = [],
  onDiagonalClick,
  highlightedDiagonal,
}) => {
  const handleDiagonalClick = (diagonal: any) => {
    if (onDiagonalClick) {
      onDiagonalClick(diagonal);
    }
  };

  if (!diagonalStats || diagonalStats.length === 0) {
    return (
      <StatsContainer>
        <EmptyState>
          暂无对角线数据
        </EmptyState>
      </StatsContainer>
    );
  }

  return (
    <StatsContainer>
      <DiagonalList>
        {diagonalStats.map((diagonal) => (
          <DiagonalItem
            key={diagonal.diagonal_num}
            highlighted={highlightedDiagonal === diagonal.diagonal_num}
            onClick={() => handleDiagonalClick(diagonal)}
            title={`点击高亮对角线 ${diagonal.diagonal_num} (${diagonal.sequence.length} 个颜色段)`}
          >
            <DiagonalNumber>#{diagonal.diagonal_num}</DiagonalNumber>

            <SequenceContainer>
              {diagonal.sequence.map((item, index) => {
                const colorIndex = item[0];
                const count = item[1];
                // 从颜色统计中找到对应的颜色
                const colorInfo = colorStats.find(c => c.color_index === colorIndex);
                const colorHex = colorInfo ? colorInfo.hex : '#999999';

                return (
                  <SequenceItem
                    key={index}
                    color={colorHex}
                    count={count}
                    title={`颜色 #${colorIndex}: ${count} 个像素`}
                  />
                );
              })}
            </SequenceContainer>
          </DiagonalItem>
        ))}
      </DiagonalList>
    </StatsContainer>
  );
};

export default DiagonalStats; 