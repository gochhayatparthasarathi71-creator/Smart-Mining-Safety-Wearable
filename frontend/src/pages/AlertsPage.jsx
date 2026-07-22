import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Filter } from 'lucide-react';
import { alertApi } from '../services/api.js';
import socket from '../services/socket.js';

const SEVERITY_STYLE = {
  CRITICAL: 'text-critical bg-critical/10 border-critical/30',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  MEDIUM: 'text-warning bg-warning/10 border-warning/30',
  LOW: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unresolved'); // unresolved | all

  const load = async () => {
    setLoading(true);
    try {
      const params = filter === 'unresolved' ? { resolved: 'false' } : {};
      const { data } = await alertApi.getAll(params);
      setAlerts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    const onNew = (alert) => {
      if (filter === 'all' || !alert.resolved) {
        setAlerts((prev) => [alert, ...prev]);
      }
    };
    socket.on('alert:new', onNew);
    return () => socket.off('alert:new', onNew);
  }, [filter]);

  const handleResolve = async (id) => {
    try {
      await alertApi.resolve(id, 'Control Room Operator');
      setAlerts((prev) => (filter === 'unresolved' ? prev.filter((a) => a._id !== id) : prev.map((a) => (a._id === id ? { ...a, resolved: true } : a))));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Alert Log</h1>
          <p className="text-sm text-slate-400">All safety threshold breaches and SOS events</p>
        </div>
        <div className="flex items-center gap-2 bg-mine-panel border border-mine-border rounded-lg p-1">
          <button
            onClick={() => setFilter('unresolved')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${filter === 'unresolved' ? 'bg-mine-accent text-mine-dark' : 'text-slate-400 hover:text-white'}`}
          >
            Unresolved
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition ${filter === 'all' ? 'bg-mine-accent text-mine-dark' : 'text-slate-400 hover:text-white'}`}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-mine-accent" size={28} />
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-mine-panel border border-mine-border rounded-xl p-8 text-center text-slate-400 text-sm">
          <Filter className="mx-auto mb-2 text-slate-600" size={24} />
          No {filter === 'unresolved' ? 'unresolved' : ''} alerts. All clear! 👷
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className="bg-mine-panel border border-mine-border rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full border uppercase ${SEVERITY_STYLE[alert.severity]}`}>
                  {alert.severity}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-slate-100 truncate">{alert.message}</p>
                  <p className="text-xs text-slate-500">
                    {alert.miner?.name} · {alert.miner?.beltId} · {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {!alert.resolved ? (
                <button
                  onClick={() => handleResolve(alert._id)}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-safe/15 text-safe border border-safe/30 px-3 py-1.5 rounded-lg hover:bg-safe/25 transition"
                >
                  <CheckCircle2 size={14} /> Resolve
                </button>
              ) : (
                <span className="shrink-0 text-xs text-slate-500 italic">Resolved</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
