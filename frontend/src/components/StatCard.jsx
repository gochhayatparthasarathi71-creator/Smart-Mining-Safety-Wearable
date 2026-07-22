import React from 'react';

export default function StatCard({ icon: Icon, label, value, colorClass = 'text-mine-accent', sub }) {
  return (
    <div className="bg-mine-panel border border-mine-border rounded-xl p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
