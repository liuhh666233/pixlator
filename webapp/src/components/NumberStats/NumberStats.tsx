import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import type { NumberStatsProps } from '../../types';

const StatsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;



const NumberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  max-height: 75vh;
  min-height: 400px;
`;

const NumberItem = styled.div<{ highlighted: boolean }>`
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

const Number = styled.div`
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
  max-width: none;
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
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

const Description = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

const DescriptionTitle = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 13px;
`;

const DescriptionText = styled.div`
  color: #666;
`;



const NumberStats: React.FC<NumberStatsProps> = ({
  numberStats,
  colorStats = [],
  onNumberClick,
  highlightedNumber,
  sortOrder = 'asc',
}) => {
  const handleNumberClick = (number: any) => {
    if (onNumberClick) {
      onNumberClick(number);
    }
  };

  // 根据排序方式对编号数据进行排序
  const sortedNumberStats = useMemo(() => {
    if (!numberStats) return [];

    return [...numberStats].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.number - b.number;
      } else {
        return b.number - a.number;
      }
    });
  }, [numberStats, sortOrder]);

  if (!numberStats || numberStats.length === 0) {
    return (
      <StatsContainer>
        <EmptyState>
          暂无编号数据
        </EmptyState>
      </StatsContainer>
    );
  }

  return (
    <StatsContainer>
      <Description>
        <DescriptionTitle>📋 编号分组说明</DescriptionTitle>
        <DescriptionText>
          每个编号组内的色号按照蛇形路径排列：<br />
          • <strong>奇数组号</strong>：从右往左排列<br />
          • <strong>偶数组号</strong>：从左往右排列<br />
          点击编号可高亮显示对应的像素区域。
        </DescriptionText>
      </Description>

      <NumberList>
        {sortedNumberStats.map((number) => (
          <NumberItem
            key={number.number}
            highlighted={highlightedNumber === number.number}
            onClick={() => handleNumberClick(number)}
            title={`点击高亮编号 ${number.number} (${number.sequence.length} 个颜色段)`}
          >
            <Number>#{number.number}</Number>

            <SequenceContainer>
              {number.sequence.map((item, index) => {
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
          </NumberItem>
        ))}
      </NumberList>
    </StatsContainer>
  );
};

export default NumberStats; 