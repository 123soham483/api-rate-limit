import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#ef4444', '#10b981']; // Red for blocked, Green for allowed

const Analytics = ({ trafficLog }) => {
    const data = useMemo(() => {
        let allowed = 0;
        let blocked = 0;
        trafficLog.forEach(log => {
            if (log.status === 'Allowed') allowed++;
            else blocked++;
        });

        return [
            { name: 'Blocked', value: blocked },
            { name: 'Allowed', value: allowed },
        ];
    }, [trafficLog]);

    const hasData = data.some(d => d.value > 0);

    return (
        <div className="bg-[var(--color-dark-card)] border border-[var(--color-dark-border)] rounded-xl p-5 shadow-lg h-[300px] flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2 text-purple-400" /> Analytics Overview
            </h2>

            <div className="flex-1 relative flex items-center justify-center">
                {!hasData ? (
                    <p className="text-gray-500 text-sm">No data to display yet.</p>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                stroke="none"
                                dataKey="value"
                                paddingAngle={5}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e212b', borderColor: '#2d313f', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default Analytics;
