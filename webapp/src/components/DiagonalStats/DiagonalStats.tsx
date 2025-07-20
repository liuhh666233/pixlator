import React from 'react';
import styled from 'styled-components';
import type { DiagonalStatsProps } from '../../types';

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

const DiagonalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 400px;
  overflow-y: auto;
`;

const DiagonalItem = styled.div<{ highlighted: boolean }>`
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

const DiagonalNumber = styled.div`
  font-weight: 600;
  color: #2196f3;
  font-size: 12px;
  min-width: 50px;
`;

const SequenceContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  align-items: center;
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

const TotalDiagonals = styled.span`
  font-weight: 600;
  color: #2196f3;
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
        <Title>对角线统计</Title>
        <EmptyState>
          暂无对角线数据
        </EmptyState>
      </StatsContainer>
    );
  }

  return (
    <StatsContainer>
      <Title>对角线统计 ({diagonalStats.length} 条对角线)</Title>

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

      <Summary>
        <span>总对角线数:</span>
        <TotalDiagonals>{diagonalStats.length}</TotalDiagonals>
      </Summary>
    </StatsContainer>
  );
};

export default DiagonalStats; 