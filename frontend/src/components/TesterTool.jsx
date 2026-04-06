import { useState } from 'react';
import { Play, ShieldAlert, Zap } from 'lucide-react';
import clsx from 'clsx';

const TesterTool = ({ apiUrl }) => {
    const [loadingRoute, setLoadingRoute] = useState(null);

    const testEndpoint = async (route) => {
        setLoadingRoute(route);
        try {
            const isPost = route === '/login';
            // Use VITE_API_URL if present, otherwise fallback to prop apiUrl, otherwise fallback to local dev default
            const baseUrl = import.meta.env.VITE_API_URL || apiUrl || 'http://localhost:5000';
            const response = await fetch(`${baseUrl}${route}`, {
        method: isPost ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        ...(isPost && { body: JSON.stringify({ user: 'test' }) }),
      });
      // the result/error will naturally show up in the live traffic feed
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoadingRoute(null), 200); // UI feedback delay
    }
  };

  return (
    <div className="bg-[var(--color-dark-card)] border border-[var(--color-dark-border)] rounded-xl p-5 shadow-lg flex-1">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Zap className="w-5 h-5 mr-2 text-yellow-400" /> API Tester
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Simulate traffic to see the sliding window rate limiter in action.
      </p>

      <div className="space-y-3">
        <TestButton 
          name="Home (GET)" 
          limit="100 req/min"
          route="/api/home" 
          onClick={() => testEndpoint('/api/home')}
          isLoading={loadingRoute === '/api/home'}
        />
        <TestButton 
          name="Search (GET)" 
          limit="20 req/min"
          route="/api/search" 
          onClick={() => testEndpoint('/api/search')}
          isLoading={loadingRoute === '/api/search'}
        />
        <TestButton 
          name="Login (POST)" 
          limit="5 req/min"
          route="/api/login"
          variant="danger"
          onClick={() => testEndpoint('/api/login')}
          isLoading={loadingRoute === '/api/login'}
        />
      </div>
    </div>
  );
};

function TestButton({ name, limit, onClick, isLoading, variant = 'primary' }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "relative w-full flex items-center justify-between px-4 py-3 rounded-lg border focus:outline-none transition-all overflow-hidden",
        variant === 'primary' 
          ? "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-200"
          : "border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-200"
      )}
    >
      <div className="flex flex-col items-start z-10">
        <span className="font-medium">{name}</span>
        <span className="text-xs opacity-70 mt-1">{limit}</span>
      </div>
      <div className={clsx("p-2 rounded-md z-10", variant === 'primary' ? "bg-blue-500/20" : "bg-red-500/20")}>
        {variant === 'danger' ? <ShieldAlert className={clsx("w-4 h-4", isLoading && "animate-pulse")} /> : <Play className={clsx("w-4 h-4", isLoading && "animate-ping")} />}
      </div>
    </button>
  );
}

export default TesterTool;
