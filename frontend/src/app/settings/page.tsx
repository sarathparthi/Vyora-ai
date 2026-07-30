'use client';

import { useEffect, useState } from 'react';
import { User, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUserEmail } from '@/lib/api';

export default function SettingsPage() {
  const [name, setName] = useState('User');
  const [email, setEmail] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    const userEmail = getCurrentUserEmail();
    setEmail(userEmail);
    const storedUser = localStorage.getItem('vyora_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.name) setName(u.name);
      } catch (e) {}
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const storedUser = localStorage.getItem('vyora_user');
    let uObj: any = { email, name };
    if (storedUser) {
      try {
        uObj = { ...JSON.parse(storedUser), name };
      } catch (e) {}
    }
    localStorage.setItem('vyora_user', JSON.stringify(uObj));
    setSavedMessage('Profile updated successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform & Security Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage master user profile, Argon2 security policies, active devices, and notification preferences.</p>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Profile Section */}
      <form onSubmit={handleSaveProfile} className="glass-card p-6 rounded-2xl space-y-6">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          <span>Master Account Profile</span>
        </h2>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-blue-500/40 shadow-lg">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-base text-white">{name}</h3>
            <p className="text-xs text-slate-400">{email || 'user@vyora.ai'} • Primary Identity</p>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold mt-1 inline-block">
              Verified Account Identity
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Email Address (Immutable Master Identity)</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 outline-none cursor-not-allowed font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all"
          >
            Save Profile Changes
          </button>
        </div>
      </form>

      {/* Security & Active Devices Section */}
      <div className="glass-card p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Enterprise Security & Device Sessions</span>
          </h2>
          <Link
            href="/settings/security"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md"
          >
            Manage Active Devices
          </Link>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <p className="font-semibold text-white">Password Hashing Engine</p>
              <p className="text-slate-400 text-[11px]">Argon2id with 64 MB memory cost & GPU brute force protection</p>
            </div>
            <span className="text-emerald-400 font-bold">Active</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <p className="font-semibold text-white">Brute Force Protection</p>
              <p className="text-slate-400 text-[11px]">5 consecutive failed attempts trigger 15-minute account lock</p>
            </div>
            <span className="text-emerald-400 font-bold">Enforced</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <p className="font-semibold text-white">Multi-Device Active Sessions</p>
              <p className="text-slate-400 text-[11px]">Desktop, Laptop, Tablet & Mobile independent session tokens</p>
            </div>
            <Link href="/settings/security" className="text-blue-400 hover:text-blue-300 font-semibold">
              View Active Devices →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
