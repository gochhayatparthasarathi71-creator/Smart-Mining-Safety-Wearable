import React, { useEffect, useState, useMemo } from 'react';
import { Users, ShieldCheck, AlertTriangle, Siren, Loader2 } from 'lucide-react';
import { minerApi, sensorApi } from '../services/api.js';
import socket from '../services/socket.js';
import StatCard from '../components/StatCard.jsx';
import MinerCard from '../components/MinerCard.jsx';
import AlertToast from '../components/AlertToast.jsx';

export default function Dashboard() {
  const [miners, setMiners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sosLoading, setSosLoading] = useState(false);

  const fetchMiners = async () => {
    try {
      const { data } = await minerApi.getAll();
      setMiners(data.data);
    } catch (err) {
      console.error('Failed to load miners:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMiners();

    const onUpdate = ({ miner, reading }) => {
      setMiners((prev) =>
        prev.map((m) => (m._id === miner._id ? { ...m, status: miner.status, latestReading: reading } : m))
      );
    };
    socket.on('sensor:update', onUpdate);
    return () => socket.off('sensor:update', onUpdate);
  }, []);

  const stats = useMemo(() => {
    const total = miners.length;
    const safe = miners.filter((m) => m.status === 'SAFE').length;
    const warning = miners.filter((m) => m.status === 'WARNING').length;
    const critical = miners.filter((m) => m.status === 'CRITICAL').length;
    return { total, safe, warning, critical };
  }, [miners]);

  const handleDemoSOS = async () => {
    if (miners.length === 0) return;
    setSosLoading(true);
    try {
      const randomMiner = miners[Math.floor(Math.random() * miners.length)];
      await sensorApi.triggerSOS(randomMiner.beltId, randomMiner.latestReading?.location);
    } catch (err) {
      console.error(err);
    } finally {
      setSosLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-mine-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <AlertToast />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Control Room Dashboard</h1>
          <p className="text-sm text-slate-400">Live monitoring of all active miners underground</p>
        </div>
        <button
          onClick={handleDemoSOS}
          disabled={sosLoading}
          className="flex items-center gap-2 bg-critical hover:brightness-110 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition disabled:opacity-60"
          title="Simulates a miner pressing the panic button on their belt"
        >
          <Siren size={16} />
          {sosLoading ? 'Sending...' : 'Trigger Demo SOS'}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Miners Active" value={stats.total} colorClass="text-sky-400" />
        <StatCard icon={ShieldCheck} label="Safe" value={stats.safe} colorClass="text-safe" />
        <StatCard icon={AlertTriangle} label="Warning" value={stats.warning} colorClass="text-warning" />
        <StatCard icon={Siren} label="Critical" value={stats.critical} colorClass="text-critical" />
      </div>

      {/* Miner grid */}
      <h2 className="text-sm font-semibold text-slate-300 mb-3">All Miners</h2>
      {miners.length === 0 ? (
        <div className="bg-mine-panel border border-mine-border rounded-xl p-8 text-center text-slate-400 text-sm">
          No miners found. Run <code className="text-mine-accent">npm run seed</code> in the backend to load demo data.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {miners.map((miner) => (
            <MinerCard key={miner._id} miner={miner} />
          ))}
        </div>
      )}
    </div>
  );
}
