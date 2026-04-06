import { Activity, Copy, Ban, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

const TrafficFeed = ({ trafficLog, apiUrl }) => {
    const handleBlock = async (ip) => {
        try {
            await fetch(`${apiUrl}/api/admin/block`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-key': 'supersecret' },
                body: JSON.stringify({ ip })
            });
        } catch (err) { console.error('Block failed', err); }
    };

    const handleUnblock = async (ip) => {
        try {
            await fetch(`${apiUrl}/api/admin/unblock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-key': 'supersecret' },
                body: JSON.stringify({ ip })
            });
        } catch (err) { console.error('Unblock failed', err); }
    };

    const handleCopy = (ip) => {
        navigator.clipboard.writeText(ip);
    };

    return (
        <div className="bg-[var(--color-dark-card)] border border-[var(--color-dark-border)] rounded-xl flex flex-col shadow-lg flex-1 overflow-hidden">
            <div className="p-5 border-b border-[var(--color-dark-border)] flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-400" /> Live Traffic Feed
                </h2>
                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                    Live Connection
                </span>
            </div>

            <div className="flex-1 overflow-auto max-h-[600px]">
                {trafficLog.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        Waiting for traffic...
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#191b24] text-gray-400 sticky top-0 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-3 font-medium">Timestamp</th>
                                <th className="px-6 py-3 font-medium">IP Address</th>
                                <th className="px-6 py-3 font-medium">Endpoint</th>
                                <th className="px-6 py-3 font-medium text-right">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-dark-border)]">
                            {trafficLog.map((log) => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-gray-300 font-mono text-xs">
                                        <div className="flex items-center space-x-2">
                                            <span>{log.ip}</span>
                                            <button onClick={() => handleCopy(log.ip)} className="text-gray-500 hover:text-white transition-colors" title="Copy IP">
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-blue-300 font-mono text-xs">{log.endpoint}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span
                                            className={clsx(
                                                "px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide",
                                                log.status === 'Allowed'
                                                    ? "bg-green-500/10 text-green-400"
                                                    : "bg-red-500/10 text-red-400 animate-pulse shadow-red-500/50 shadow-lg"
                                            )}
                                        >
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-3">
                                            <button onClick={() => handleUnblock(log.ip)} className="text-green-500 hover:text-green-300 transition-colors" title="Unblock IP">
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleBlock(log.ip)} className="text-red-500 hover:text-red-300 transition-colors" title="Block IP">
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default TrafficFeed;
