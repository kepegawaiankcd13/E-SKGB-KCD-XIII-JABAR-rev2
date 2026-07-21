/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  BarChart3, 
  Users, 
  FileText, 
  FileSpreadsheet,
  Bell, 
  Settings, 
  History, 
  LogOut, 
  ShieldCheck 
} from "lucide-react";
import { StaffUser } from "../types";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
  activeUser: StaffUser | null;
  isFirebaseConnected?: boolean;
  connectionError?: string | null;
}

export default function Navbar({ currentTab, setCurrentTab, onLogout, activeUser, isFirebaseConnected = true, connectionError = null }: NavbarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "database", label: "Data Pegawai", icon: Users },
    { id: "cetak-skgb", label: "Cetak SKGB", icon: FileText },
    { id: "laporan", label: "Laporan SKGB", icon: FileSpreadsheet },
    { id: "notifikasi", label: "Notifikasi KGB", icon: Bell },
    { id: "manajemen-staf", label: "Kelola Staf / Akun", icon: ShieldCheck },
    { id: "logs", label: "Log Aktivitas", icon: History },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 print:hidden shrink-0 shadow-xl border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Lambang_Pemerintah_Provinsi_Jawa_Barat.svg/512px-Lambang_Pemerintah_Provinsi_Jawa_Barat.svg.png" 
            alt="Logo Jabar" 
            className="w-9 h-9 object-contain shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="overflow-hidden">
            <h1 className="text-white font-bold leading-none text-sm truncate">E-SKGB JABAR</h1>
            <span className="text-slate-400 text-[10px] uppercase tracking-wider block mt-0.5">Disdik KCD XIII</span>
          </div>
        </div>
        
        {/* Connection Indicator status */}
        <div className="mt-4 text-[10px] bg-slate-850/80 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center justify-center gap-2 font-sans">
          {connectionError ? (
            <>
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </div>
              <span className="text-rose-400 font-medium text-[9px] tracking-wide">Mongo Blocked IP</span>
            </>
          ) : isFirebaseConnected ? (
            <>
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-emerald-400 font-bold text-[9px] tracking-wide uppercase">Mongo Connected</span>
            </>
          ) : (
            <>
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </div>
              <span className="text-amber-400 font-medium text-[9px] tracking-wide">Mongo Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-150 group cursor-pointer ${
                isActive
                  ? "bg-indigo-600/20 text-white font-semibold border-r-4 border-indigo-500"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Icon 
                size={18} 
                className={`${
                  isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-white"
                } transition-colors shrink-0`} 
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3 mb-3">
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1.5">Sesi Masuk Aktif</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-650 flex items-center justify-center text-xs font-bold text-white shrink-0 uppercase border border-indigo-500/30">
              {activeUser?.name ? activeUser.name.trim().split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("") : "ST"}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-bold truncate leading-tight" title={activeUser?.name || "Staf Kepegawaian"}>
                {activeUser?.name || "Staf Kepegawaian"}
              </p>
              <p className="text-slate-400 text-[9px] truncate font-sans block leading-none mt-0.5">
                {activeUser?.role || "Staf Administrasi"}
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 hover:text-white rounded-lg text-xs font-semibold border border-rose-900/30 transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </aside>
  );
}
