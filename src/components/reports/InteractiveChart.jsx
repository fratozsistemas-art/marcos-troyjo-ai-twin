import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Download, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];

export default function InteractiveChart({ type = 'bar', data, title }) {
    const [expanded, setExpanded] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);

    if (!data || !data.labels || !data.datasets) {
        return null;
    }

    // Transform data for recharts
    const chartData = data.labels.map((label, idx) => {
        const point = { name: label };
        data.datasets.forEach((dataset, dsIdx) => {
            point[dataset.label || `series_${dsIdx}`] = dataset.data[idx];
        });
        return point;
    });

    const handleDownload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1200;
        canvas.height = 600;
        
        // Simple export - in production use html2canvas
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${title || 'chart'}.png`;
        link.href = dataURL;
        link.click();
    };

    const renderChart = (width = '100%', height = 300) => {
        const commonProps = {
            data: chartData,
            margin: { top: 5, right: 30, left: 20, bottom: 5 }
        };

        switch (type) {
            case 'line':
                return (
                    <ResponsiveContainer width={width} height={height}>
                        <LineChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {data.datasets.map((dataset, idx) => (
                                <Line
                                    key={idx}
                                    type="monotone"
                                    dataKey={dataset.label || `series_${idx}`}
                                    stroke={COLORS[idx % COLORS.length]}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width={width} height={height}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey={data.datasets[0]?.label || 'value'}
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={height / 3}
                                label
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'area':
                return (
                    <ResponsiveContainer width={width} height={height}>
                        <AreaChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {data.datasets.map((dataset, idx) => (
                                <Area
                                    key={idx}
                                    type="monotone"
                                    dataKey={dataset.label || `series_${idx}`}
                                    stroke={COLORS[idx % COLORS.length]}
                                    fill={COLORS[idx % COLORS.length]}
                                    fillOpacity={0.6}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                );

            default: // bar
                return (
                    <ResponsiveContainer width={width} height={height}>
                        <BarChart {...commonProps}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {data.datasets.map((dataset, idx) => (
                                <Bar
                                    key={idx}
                                    dataKey={dataset.label || `series_${idx}`}
                                    fill={COLORS[idx % COLORS.length]}
                                    radius={[8, 8, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <>
            <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-700">{title}</h4>
                    <div className="flex gap-2">
                        <Button onClick={() => setExpanded(true)} variant="ghost" size="sm">
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={handleDownload} variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                {renderChart()}
            </Card>

            <Dialog open={expanded} onOpenChange={setExpanded}>
                <DialogContent className="max-w-6xl h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1">
                        {renderChart('100%', '100%')}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}