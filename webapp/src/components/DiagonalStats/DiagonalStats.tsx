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
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
`;

const DiagonalItem = styled.div<{ highlighted: boolean }>`
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

const DiagonalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const DiagonalNumber = styled.div`
  font-weight: 600;
  color: #2196f3;
  font-size: 14px;
`;

const SequenceLength = styled.div`
  font-size: 12px;
  color: #666;
`;

const SequenceContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const SequenceItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
`;

const ColorIndex = styled.span`
  font-weight: 600;
  color: #2196f3;
`;

const Count = styled.span`
  color: #666;
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
                        title={`点击高亮对角线 ${diagonal.diagonal_num}`}
                    >
                        <DiagonalHeader>
                            <DiagonalNumber>对角线 #{diagonal.diagonal_num}</DiagonalNumber>
                            <SequenceLength>{diagonal.sequence.length} 个颜色</SequenceLength>
                        </DiagonalHeader>

                        <SequenceContainer>
                            {diagonal.sequence.map((item, index) => (
                                <SequenceItem key={index}>
                                    <ColorIndex>#{item[0]}</ColorIndex>
                                    <Count>×{item[1]}</Count>
                                </SequenceItem>
                            ))}
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