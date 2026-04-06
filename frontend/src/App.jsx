import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import TesterTool from './components/TesterTool';
import TrafficFeed from './components/TrafficFeed';
import Analytics from './components/Analytics';
import SystemStats from './components/SystemStats';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(API_URL);

function App() {
  const [trafficLog, setTrafficLog] = useState([]);

  useEffect(() => {
    socket.on('traffic_history', (history) => {
      setTrafficLog(history);
    });

    socket.on('traffic_event', (event) => {
      setTrafficLog((prev) => [event, ...prev].slice(0, 100)); // Keep only newest 100
    });

    return () => {
      socket.off('traffic_history');
      socket.off('traffic_event');
    };
  }, []);

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to clear all rate limits? This will instantly let all users back in.')) {
      try {
        await fetch(`${API_URL}/api/admin/reset`, {
          method: 'POST',
          headers: { 'x-admin-key': 'supersecret' }
        });
      } catch (err) {
        console.error('Reset failed:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-dark-bg)] p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between pb-4 border-b border-[var(--color-dark-border)]">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">API Rate Limiter Service</h1>
              <p className="text-gray-400 text-sm">High-performance sliding window counter based on Redis</p>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg transition-colors text-sm font-semibold shadow-lg shadow-red-500/20"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Clear All Limits
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Tester & Analytics */}
          <div className="lg:col-span-1 space-y-6 flex flex-col">
            <SystemStats apiUrl={API_URL} />
            <TesterTool apiUrl={API_URL} />
            <Analytics trafficLog={trafficLog} />
          </div>

          {/* Right Column: Live Feed */}
          <div className="lg:col-span-2 flex flex-col min-h-[500px]">
            <TrafficFeed trafficLog={trafficLog} apiUrl={API_URL} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
