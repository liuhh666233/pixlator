import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ColorStats from '../ColorStats/ColorStats';
import NumberStats from '../NumberStats/NumberStats';
import type { ColorStat, NumberStat, HistoryItem } from '../../types';

const PanelContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-width: 280px;
  max-width: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  overflow: visible;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin: -20px -20px 0 -20px;
  padding: 0 20px;
  flex-wrap: wrap;
  width: 100%;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 10px 14px;
  border: none;
  background: none;
  color: ${props => props.active ? '#2196f3' : '#666'};
  font-size: 12px;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#2196f3' : 'transparent'};
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
  flex: 1;
  min-width: 0;

  &:hover {
    color: ${props => props.active ? '#2196f3' : '#333'};
    background: ${props => props.active ? 'transparent' : '#f5f5f5'};
  }

  &:not(:last-child) {
    margin-right: 2px;
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

const LoadingState = styled.div`
  text-align: center;
  color: #666;
  padding: 40px 20px;
  font-size: 14px;
`;

// 历史记录相关样式
const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 60vh;
  min-height: 300px;
`;

const HistoryItem = styled.div<{ selected: boolean }>`
  display: flex;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  background: ${props => props.selected ? '#e3f2fd' : '#f8f9fa'};
  border: 1px solid ${props => props.selected ? '#2196f3' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.selected ? '#e3f2fd' : '#f0f8ff'};
    transform: translateY(-1px);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
`;

const Thumbnail = styled.div<{ imageUrl: string }>`
  width: 40px;
  height: 40px;
  border-radius: 3px;
  background-image: url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid #ddd;
  flex-shrink: 0;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ItemTitle = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemDetails = styled.div`
  font-size: 10px;
  color: #666;
`;

const ItemMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  color: #999;
`;

const StatusBadge = styled.span<{ hasResult: boolean }>`
  padding: 1px 4px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 600;
  background: ${props => props.hasResult ? '#e8f5e8' : '#fff3cd'};
  color: ${props => props.hasResult ? '#2e7d32' : '#856404'};
`;

// 使用统计相关样式
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px 0;
`;

const StatCard = styled.div`
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #2196f3;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
`;

const StatItemLabel = styled.span`
  color: #333;
  font-weight: 500;
`;

const StatItemValue = styled.span`
  color: #2196f3;
  font-weight: 600;
`;

interface StatsPanelProps {
    colorStats?: ColorStat[];
    numberStats?: NumberStat[];
    onColorClick?: (color: ColorStat) => void;
    onNumberClick?: (number: NumberStat) => void;
    highlightedColor?: string;
    highlightedNumber?: number;
    onHistoryItemClick?: (item: HistoryItem) => void;
    onHistoryItemDelete?: (filename: string) => void;
    selectedHistoryItem?: string;
}

type TabType = 'colors' | 'diagonals' | 'history' | 'usage';
type SortOrder = 'asc' | 'desc';

const StatsPanel: React.FC<StatsPanelProps> = ({
    colorStats = [],
    numberStats = [],
    onColorClick,
    onNumberClick,
    highlightedColor,
    highlightedNumber,
    onHistoryItemClick,
    onHistoryItemDelete,
    selectedHistoryItem,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('colors');
    const [numberSortOrder, setNumberSortOrder] = useState<SortOrder>('asc');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/history');
            const result = await response.json();

            if (result.success) {
                setHistory(result.data);
            } else {
                setError('Failed to load history');
            }
        } catch (err) {
            setError('Network error');
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history' || activeTab === 'usage') {
            fetchHistory();
        }
    }, [activeTab]);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
    };

    const handleNumberSortToggle = () => {
        setNumberSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handleHistoryItemClick = (item: HistoryItem) => {
        if (onHistoryItemClick) {
            onHistoryItemClick(item);
        }
    };

    const handleHistoryItemDelete = async (filename: string, event: React.MouseEvent) => {
        event.stopPropagation();

        if (onHistoryItemDelete) {
            onHistoryItemDelete(filename);
        }

        try {
            const response = await fetch(`/api/files/${filename}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchHistory();
            }
        } catch (err) {
            console.error('Error deleting file:', err);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // 计算使用统计
    const calculateUsageStats = () => {
        const totalFiles = history.length;
        const processedFiles = history.filter(item => item.has_processing_result).length;
        const totalSize = history.reduce((sum, item) => sum + item.file_size, 0);
        const avgSize = totalFiles > 0 ? totalSize / totalFiles : 0;

        // 按日期分组统计
        const dateStats = history.reduce((acc, item) => {
            const date = formatDate(item.upload_time);
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalFiles,
            processedFiles,
            totalSize,
            avgSize,
            dateStats
        };
    };

    const usageStats = calculateUsageStats();

    const renderHistoryTab = () => {
        if (loading) {
            return <LoadingState>加载历史记录中...</LoadingState>;
        }

        if (error) {
            return <EmptyState>加载失败: {error}</EmptyState>;
        }

        if (history.length === 0) {
            return <EmptyState>暂无历史记录</EmptyState>;
        }

        return (
            <HistoryList>
                {history.map((item) => (
                    <HistoryItem
                        key={item.filename}
                        selected={selectedHistoryItem === item.filename}
                        onClick={() => handleHistoryItemClick(item)}
                    >
                        <Thumbnail imageUrl={item.preview_url} />
                        <ItemInfo>
                            <ItemTitle>{item.original_filename}</ItemTitle>
                            <ItemDetails>
                                {item.dimensions.width} × {item.dimensions.height} • {formatFileSize(item.file_size)}
                            </ItemDetails>
                            <ItemMeta>
                                <span>{formatDate(item.upload_time)}</span>
                                <StatusBadge hasResult={item.has_processing_result || false}>
                                    {item.has_processing_result ? '已处理' : '未处理'}
                                </StatusBadge>
                            </ItemMeta>
                        </ItemInfo>
                        <button
                            onClick={(e) => handleHistoryItemDelete(item.filename, e)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#999',
                                cursor: 'pointer',
                                fontSize: '14px',
                                padding: '2px',
                                borderRadius: '2px',
                            }}
                            title="删除"
                        >
                            ×
                        </button>
                    </HistoryItem>
                ))}
            </HistoryList>
        );
    };

    const renderUsageTab = () => {
        if (loading) {
            return <LoadingState>加载统计数据中...</LoadingState>;
        }

        if (error) {
            return <EmptyState>加载失败: {error}</EmptyState>;
        }

        return (
            <div>
                <StatsGrid>
                    <StatCard>
                        <StatValue>{usageStats.totalFiles}</StatValue>
                        <StatLabel>总文件数</StatLabel>
                    </StatCard>
                    <StatCard>
                        <StatValue>{usageStats.processedFiles}</StatValue>
                        <StatLabel>已处理</StatLabel>
                    </StatCard>
                    <StatCard>
                        <StatValue>{formatFileSize(usageStats.totalSize)}</StatValue>
                        <StatLabel>总大小</StatLabel>
                    </StatCard>
                    <StatCard>
                        <StatValue>{formatFileSize(usageStats.avgSize)}</StatValue>
                        <StatLabel>平均大小</StatLabel>
                    </StatCard>
                </StatsGrid>

                <StatList>
                    <StatItem>
                        <StatItemLabel>处理完成率</StatItemLabel>
                        <StatItemValue>
                            {usageStats.totalFiles > 0
                                ? Math.round((usageStats.processedFiles / usageStats.totalFiles) * 100)
                                : 0}%
                        </StatItemValue>
                    </StatItem>
                    <StatItem>
                        <StatItemLabel>最近7天上传</StatItemLabel>
                        <StatItemValue>
                            {Object.entries(usageStats.dateStats)
                                .slice(0, 7)
                                .reduce((sum, [_, count]) => sum + count, 0)}
                        </StatItemValue>
                    </StatItem>
                    <StatItem>
                        <StatItemLabel>最大文件</StatItemLabel>
                        <StatItemValue>
                            {history.length > 0
                                ? formatFileSize(Math.max(...history.map(item => item.file_size)))
                                : '0 B'}
                        </StatItemValue>
                    </StatItem>
                </StatList>
            </div>
        );
    };

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
                    onDoubleClick={handleNumberSortToggle}
                    title="双击切换排序方式"
                >
                    编号分组 {activeTab === 'diagonals' && (numberSortOrder === 'asc' ? '↑' : '↓')}
                </TabButton>
                <TabButton
                    active={activeTab === 'history'}
                    onClick={() => handleTabChange('history')}
                >
                    历史记录
                </TabButton>
                <TabButton
                    active={activeTab === 'usage'}
                    onClick={() => handleTabChange('usage')}
                >
                    使用统计
                </TabButton>
            </TabContainer>

            <TabContent>
                {activeTab === 'colors' ? (
                    colorStats.length > 0 ? (
                        <ColorStats
                            colorStats={colorStats}
                            onColorClick={onColorClick}
                            highlightedColor={highlightedColor}
                        />
                    ) : (
                        <EmptyState>暂无颜色统计数据</EmptyState>
                    )
                ) : activeTab === 'diagonals' ? (
                    numberStats.length > 0 ? (
                        <NumberStats
                            numberStats={numberStats}
                            colorStats={colorStats}
                            onNumberClick={onNumberClick}
                            highlightedNumber={highlightedNumber}
                            sortOrder={numberSortOrder}
                        />
                    ) : (
                        <EmptyState>暂无编号统计数据</EmptyState>
                    )
                ) : activeTab === 'history' ? (
                    renderHistoryTab()
                ) : (
                    renderUsageTab()
                )}
            </TabContent>
        </PanelContainer>
    );
};

export default StatsPanel;