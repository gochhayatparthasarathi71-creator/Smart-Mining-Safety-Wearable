import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { HardHat, LayoutDashboard, Bell, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import socket from '../services/socket.js';
import { alertApi } from '../services/api.js';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [connected, setConnected] = useState(socket.connected);
  const [unresolvedCount, setUnresolvedCount] = useState(0);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    const refreshStats = () => {
      alertApi.stats().then(({ data }) => setUnresolvedCount(data.data.unresolved)).catch(() => {});
    };
    refreshStats();
    socket.on('alert:new', refreshStats);
    socket.on('alert:resolved', refreshStats);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('alert:new', refreshStats);
      socket.off('alert:resolved', refreshStats);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-mine-accent/15 text-mine-accent' : 'text-slate-300 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="flex h-screen bg-mine-dark text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-mine-panel border-r border-mine-border flex flex-col">
        <div className="px-5 py-5 border-b border-mine-border flex items-center gap-2">
          <HardHat className="text-mine-accent" size={26} />
          <div>
            <p className="font-bold text-sm leading-tight">Smart Mining</p>
            <p className="text-xs text-slate-400 leading-tight">Safety Belt System</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink to="/" end className={navLinkClass}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/alerts" className={navLinkClass}>
            <Bell size={18} />
            Alerts
            {unresolvedCount > 0 && (
              <span className="ml-auto bg-critical text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unresolvedCount}
              </span>
            )}
          </NavLink>
        </nav>

        <div className="px-4 py-3 border-t border-mine-border">
          <div className={`flex items-center gap-2 text-xs mb-3 ${connected ? 'text-safe' : 'text-critical'}`}>
            {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {connected ? 'Live feed connected' : 'Reconnecting...'}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-critical transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
