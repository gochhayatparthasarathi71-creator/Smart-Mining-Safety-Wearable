import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, HeartPulse, Wind, Thermometer, Battery, MapPin, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { minerApi } from '../services/api.js';
import socket from '../services/socket.js';

const STATUS_COLORS = {
  SAFE: 'text-safe border-safe/30 bg-safe/10',
  WARNING: 'text-warning border-warning/30 bg-warning/10',
  CRITICAL: 'text-critical border-critical/30 bg-critical/10',
  OFFLINE: 'text-offline border-offline/30 bg-offline/10',
};

export default function MinerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [miner, setMiner] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await minerApi.getById(id);
      setMiner(data.data.miner);
      setHistory(data.data.history.slice().reverse());
      setAlerts(data.data.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const onUpdate = ({ miner: updatedMiner, reading }) => {
      if (updatedMiner._id !== id) return;
      setMiner((prev) => (prev ? { ...prev, status: updatedMiner.status } : prev));
      setHistory((prev) => [...prev.slice(-49), reading]);
    };
    const onAlert = (alert) => {
      if (alert.miner === id || alert.miner?._id === id) {
        setAlerts((prev) => [alert, ...prev].slice(0, 20));
      }
    };
    socket.on('sensor:update', onUpdate);
    socket.on('alert:new', onAlert);
    return () => {
      socket.off('sensor:update', onUpdate);
      socket.off('alert:new', onAlert);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-mine-accent" size={32} />
      </div>
    );
  }

  if (!miner) {
    return <div className="p-6 text-slate-400">Miner not found.</div>;
  }

  const chartData = history.map((h) => ({
    time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    heartRate: h.heartRate,
    co: h.gas?.co,
    o2: h.gas?.o2,
    temp: h.bodyTemperature,
  }));

  const latest = history[history.length - 1];

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-4"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">{miner.name}</h1>
          <p className="text-sm text-slate-400">
            {miner.employeeId} · {miner.beltId} · {miner.designation} · {miner.shift} Shift
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full border uppercase ${STATUS_COLORS[miner.status]}`}>
          {miner.status}
        </span>
      </div>

      {/* Live vitals */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <VitalCard icon={HeartPulse} label="Heart Rate" value={`${latest.heartRate} bpm`} color="text-rose-400" />
          <VitalCard icon={Thermometer} label="Body Temp" value={`${latest.bodyTemperature?.toFixed(1)}°C`} color="text-orange-400" />
          <VitalCard icon={Wind} label="CO / CH4 / O2" value={`${latest.gas?.co?.toFixed(0)} / ${latest.gas?.ch4?.toFixed(2)}% / ${latest.gas?.o2?.toFixed(1)}%`} color="text-sky-400" />
          <VitalCard icon={Battery} label="Battery" value={`${latest.batteryLevel}%`} color="text-emerald-400" />
          <VitalCard icon={MapPin} label="Location" value={`${latest.location?.zone}`} sub={`${latest.location?.depth}m depth`} color="text-purple-400" />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartPanel title="Heart Rate (bpm)">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} minTickGap={30} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[30, 200]} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', fontSize: 12 }} />
            <Line type="monotone" dataKey="heartRate" stroke="#fb7185" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartPanel>

        <ChartPanel title="Gas Levels — CO (ppm) & O2 (%)">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} minTickGap={30} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', fontSize: 12 }} />
            <Line type="monotone" dataKey="co" stroke="#38bdf8" strokeWidth={2} dot={false} name="CO (ppm)" />
            <Line type="monotone" dataKey="o2" stroke="#34d399" strokeWidth={2} dot={false} name="O2 (%)" />
          </LineChart>
        </ChartPanel>
      </div>

      {/* Alert history */}
      <h2 className="text-sm font-semibold text-slate-300 mb-3">Recent Alerts</h2>
      <div className="bg-mine-panel border border-mine-border rounded-xl divide-y divide-mine-border">
        {alerts.length === 0 ? (
          <p className="p-4 text-sm text-slate-500 italic">No alerts recorded for this miner yet.</p>
        ) : (
          alerts.map((alert) => (
            <div key={alert._id} className="p-3 flex items-center justify-between text-sm">
              <div>
                <p className="text-slate-200">{alert.message}</p>
                <p className="text-xs text-slate-500">{new Date(alert.createdAt).toLocaleString()}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${STATUS_COLORS[alert.severity] || 'text-slate-400'}`}>
                {alert.severity}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function VitalCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-mine-panel border border-mine-border rounded-xl p-3.5">
      <Icon size={18} className={`${color} mb-2`} />
      <p className="text-sm font-bold text-white truncate">{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
      {sub && <p className="text-[10px] text-slate-500">{sub}</p>}
    </div>
  );
}

function ChartPanel({ title, children }) {
  return (
    <div className="bg-mine-panel border border-mine-border rounded-xl p-4">
      <p className="text-xs font-semibold text-slate-300 mb-3">{title}</p>
      <ResponsiveContainer width="100%" height={220}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
