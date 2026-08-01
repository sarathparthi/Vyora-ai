'use client';

import { useEffect, useState } from 'react';
import {
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Monitor,
  ShieldCheck,
  LogOut,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { getCurrentUserEmail } from '@/lib/api';

interface DeviceSession {
  id: string;
  name: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function DevicesPage() {
  const [userEmail, setUserEmail] = useState('');
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchDevices = async () => {
    const email = getCurrentUserEmail();
    setUserEmail(email);
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/backend/user/devices?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDevices(json.data);
        }
      }
    } catch (e) {
      console.warn('Fetch devices failed:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRevokeSingle = async (deviceId: string) => {
    if (!userEmail) return;
    setRevoking(true);
    try {
      const res = await fetch('/api/backend/user/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, deviceId }),
      });
      if (res.ok) {
        const json = await res.json();
        setDevices(json.data || []);
        setMsg('Session revoked successfully.');
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (e) {}
    setRevoking(false);
  };

  const handleRevokeAllOthers = async () => {
    if (!userEmail) return;
    setRevoking(true);
    try {
      const res = await fetch('/api/backend/user/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, action: 'REVOKE_ALL_OTHERS' }),
      });
      if (res.ok) {
        const json = await res.json();
        setDevices(json.data || []);
        setMsg('Logged out all other active device sessions.');
        setTimeout(() => setMsg(''), 3000);
      }
    } catch (e) {}
    setRevoking(false);
  };

  const getDeviceIcon = (os: string) => {
    if (os.toLowerCase().includes('android') || os.toLowerCase().includes('ios') || os.toLowerCase().includes('phone')) {
      return <Smartphone className="w-5 h-5 text-indigo-400" />;
    }
    if (os.toLowerCase().includes('ipad') || os.toLowerCase().includes('tablet')) {
      return <Tablet className="w-5 h-5 text-purple-400" />;
    }
    return <Laptop className="w-5 h-5 text-blue-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Devices &amp; Active Sessions <Laptop className="w-6 h-6 text-blue-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage all logged-in devices across Laptop, Mobile, and Tablet with remote sign-out capability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDevices}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            title="Refresh Devices"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleRevokeAllOthers}
            disabled={devices.filter((d) => !d.isCurrent).length === 0 || revoking}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/25 transition-all disabled:opacity-40"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out All Other Devices</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Security Status Banner */}
      <div className="glass-card p-6 rounded-3xl border-l-4 border-l-blue-500 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Multi-Device Cloud Synchronization Active</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Account <strong className="text-white">{userEmail}</strong> is currently active across {devices.length} authenticated devices.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>HTTPS SSL Encrypted</span>
        </span>
      </div>

      {/* Devices List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Monitor className="w-4 h-4 text-purple-400" /> Currently Authenticated Devices ({devices.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {devices.map((d) => (
            <div
              key={d.id}
              className={`glass-card p-5 rounded-2xl space-y-4 border transition-all ${
                d.isCurrent ? 'border-blue-500/60 bg-blue-500/5' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    {getDeviceIcon(d.os)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      {d.name}
                      {d.isCurrent && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          ● Current Device
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {d.browser} • {d.os}
                    </p>
                  </div>
                </div>

                {!d.isCurrent && (
                  <button
                    onClick={() => handleRevokeSingle(d.id)}
                    disabled={revoking}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all disabled:opacity-40"
                  >
                    Log Out
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">IP &amp; Location</span>
                    <span className="font-mono text-[11px]">{d.location} ({d.ip})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 block">Last Activity</span>
                    <span className="font-mono text-[11px]">{d.lastActive}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
