import { useState, useEffect } from 'react';
import { Server, Users, TrendingUp } from 'lucide-react';

const SystemStats = ({ apiUrl }) => {
    const [stats, setStats] = useState({
        totalRequests: 0,
        activeUsers: 0,
        peakBlocks: 0,
        peakTime: null
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${apiUrl}/api/admin/stats`, {
                    headers: { 'x-admin-key': 'supersecret' }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
    }, [apiUrl]);

    const formattedPeakTime = stats.peakTime 
        ? new Date(stats.peakTime).toLocaleTimeString() 
        : 'N/A';

    return (
        <div className="bg-[var(--color-dark-card)] border border-[var(--color-dark-border)] rounded-xl p-5 shadow-lg flex-1">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2 text-blue-400" /> System Health
            </h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center text-gray-300">
                        <TrendingUp className="w-4 h-4 mr-2 text-purple-400" />
                        <span className="text-sm">Total Requests</span>
                    </div>
                    <span className="font-mono text-white font-medium">{stats.totalRequests.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center text-gray-300">
                        <Users className="w-4 h-4 mr-2 text-green-400" />
                        <span className="text-sm">Active Users (5m)</span>
                    </div>
                    <span className="font-mono text-white font-medium">{stats.activeUsers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center text-gray-300 flex-col items-start">
                        <div className="flex"><TrendingUp className="w-4 h-4 mr-2 text-red-400" /><span className="text-sm">Peak Traffic Time</span></div>
                        <span className="text-xs text-gray-500 mt-1 ml-6">{stats.peakBlocks} max blocks/min</span>
                    </div>
                    <span className="font-mono text-white text-sm">{formattedPeakTime}</span>
                </div>
            </div>
        </div>
    );
};

export default SystemStats;
