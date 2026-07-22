import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Wind, Thermometer, Battery, MapPin, AlertTriangle } from 'lucide-react';

const STATUS_STYLES = {
  SAFE: { badge: 'bg-safe/15 text-safe border-safe/30', glow: 'status-glow-safe' },
  WARNING: { badge: 'bg-warning/15 text-warning border-warning/30', glow: 'status-glow-warning' },
  CRITICAL: { badge: 'bg-critical/15 text-critical border-critical/30', glow: 'status-glow-critical animate-pulse-fast' },
  OFFLINE: { badge: 'bg-offline/15 text-offline border-offline/30', glow: '' },
};

export default function MinerCard({ miner }) {
  const navigate = useNavigate();
  const status = miner.status || 'OFFLINE';
  const style = STATUS_STYLES[status] || STATUS_STYLES.OFFLINE;
  const reading = miner.latestReading;

  return (
    <div
      onClick={() => navigate(`/miners/${miner._id}`)}
      className={`bg-mine-panel border border-mine-border rounded-xl p-4 cursor-pointer hover:border-mine-accent/40 transition-all ${style.glow}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-white text-sm">{miner.name}</p>
          <p className="text-xs text-slate-400">{miner.employeeId} · {miner.beltId}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border uppercase ${style.badge}`}>
          {status === 'CRITICAL' && <AlertTriangle size={10} className="inline mr-1 -mt-0.5" />}
          {status}
        </span>
      </div>

      {reading ? (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <HeartPulse size={13} className="text-rose-400" />
            {reading.heartRate} bpm
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Thermometer size={13} className="text-orange-400" />
            {reading.bodyTemperature?.toFixed(1)}°C
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Wind size={13} className="text-sky-400" />
            CO {reading.gas?.co?.toFixed(0)} ppm
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Battery size={13} className="text-emerald-400" />
            {reading.batteryLevel}%
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 col-span-2 truncate">
            <MapPin size={13} />
            {reading.location?.zone} · {reading.location?.depth}m depth
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">Waiting for first sensor reading...</p>
      )}
    </div>
  );
}
