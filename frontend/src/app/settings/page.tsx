'use client';

import { User, ShieldCheck, Key, Bell, Moon, Sun, Lock } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform & Security Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage user account profile, 2FA security, active sessions, and notification preferences.</p>
      </div>

      {/* Profile Section */}
      <div className="glass-card p-6 rounded-2xl space-y-6">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          <span>User Profile</span>
        </h2>

        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            alt="Alex Vance"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/40"
          />
          <div>
            <h3 className="font-bold text-base text-white">Alex Vance</h3>
            <p className="text-xs text-slate-400">demo@vyora.ai • Admin Role</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold mt-1 inline-block">
              Verified Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Full Name</label>
            <input type="text" defaultValue="Alex Vance" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none" />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Email Address</label>
            <input type="email" defaultValue="demo@vyora.ai" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none" />
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="glass-card p-6 rounded-2xl space-y-6">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Security & Authentication</span>
        </h2>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <p className="font-semibold text-white">Password Hashing Engine</p>
              <p className="text-slate-400 text-[11px]">Argon2id with memory cost factor 65536 KB</p>
            </div>
            <span className="text-emerald-400 font-bold">Active</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <p className="font-semibold text-white">Two-Factor Authentication (2FA)</p>
              <p className="text-slate-400 text-[11px]">Authenticator App (TOTP)</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold">Enable 2FA</button>
          </div>
        </div>
      </div>
    </div>
  );
}
