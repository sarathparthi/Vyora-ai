'use client';

import { User, ShieldCheck, Key, Laptop, Lock } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform & Security Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage master user profile, Argon2 security policies, active devices, and notification preferences.</p>
      </div>

      {/* Profile Section */}
      <div className="glass-card p-6 rounded-2xl space-y-6">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          <span>Master Account Profile</span>
        </h2>

        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            alt="Alex Vance"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/40"
          />
          <div>
            <h3 className="font-bold text-base text-white">Alex Vance</h3>
            <p className="text-xs text-slate-400">demo@vyora.ai • Primary Identity</p>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold mt-1 inline-block">
              Verified Primary Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Full Name</label>
            <input type="text" defaultValue="Alex Vance" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none" />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Email Address (Immutable Master Identity)</label>
            <input type="email" defaultValue="demo@vyora.ai" disabled className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 outline-none cursor-not-allowed" />
          </div>
        </div>
      </div>

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
