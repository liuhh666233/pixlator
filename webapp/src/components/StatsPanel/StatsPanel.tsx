import React, { useState } from 'react';
import styled from 'styled-components';
import ColorStats from '../ColorStats/ColorStats';
import DiagonalStats from '../DiagonalStats/DiagonalStats';
import type { ColorStat, DiagonalStat } from '../../types';

const PanelContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-width: 280px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin: -20px -20px 0 -20px;
  padding: 0 20px;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 12px 20px;
  border: none;
  background: none;
  color: ${props => props.active ? '#2196f3' : '#666'};
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#2196f3' : 'transparent'};
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    color: ${props => props.active ? '#2196f3' : '#333'};
    background: ${props => props.active ? 'transparent' : '#f5f5f5'};
  }

  &:first-child {
    margin-right: 8px;
  }
`;

const TabContent = styled.div`
  flex: 1;
  min-height: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 14px;
`;

interface StatsPanelProps {
    colorStats: ColorStat[];
    diagonalStats: DiagonalStat[];
    onColorClick?: (color: ColorStat) => void;
    onDiagonalClick?: (diagonal: DiagonalStat) => void;
    highlightedColor?: string;
    highlightedDiagonal?: number;
}

type TabType = 'colors' | 'diagonals';

const StatsPanel: React.FC<StatsPanelProps> = ({
    colorStats,
    diagonalStats,
    onColorClick,
    onDiagonalClick,
    highlightedColor,
    highlightedDiagonal,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('colors');

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
    };

    if (!colorStats || colorStats.length === 0) {
        return (
            <PanelContainer>
                <EmptyState>
                    暂无统计数据
                </EmptyState>
            </PanelContainer>
        );
    }

    return (
        <PanelContainer>
            <TabContainer>
                <TabButton
                    active={activeTab === 'colors'}
                    onClick={() => handleTabChange('colors')}
                >
                    颜色统计
                </TabButton>
                <TabButton
                    active={activeTab === 'diagonals'}
                    onClick={() => handleTabChange('diagonals')}
                >
                    对角线统计
                </TabButton>
            </TabContainer>

            <TabContent>
                {activeTab === 'colors' ? (
                    <ColorStats
                        colorStats={colorStats}
                        onColorClick={onColorClick}
                        highlightedColor={highlightedColor}
                    />
                ) : (
                    <DiagonalStats
                        diagonalStats={diagonalStats}
                        colorStats={colorStats}
                        onDiagonalClick={onDiagonalClick}
                        highlightedDiagonal={highlightedDiagonal}
                    />
                )}
            </TabContent>
        </PanelContainer>
    );
};

export default StatsPanel; 