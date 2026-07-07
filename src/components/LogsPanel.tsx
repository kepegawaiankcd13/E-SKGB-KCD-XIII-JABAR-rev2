/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { History, Search, FileDown, ShieldAlert } from "lucide-react";
import { ActivityLog } from "../types";

interface LogsPanelProps {
  logs: ActivityLog[];
}

export default function LogsPanel({ logs }: LogsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = [...logs]
    .reverse() // show fresh logs first
    .filter(log => 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminUser.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const formatFullDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History size={20} className="text-indigo-600" />
            <span>Audit Trail Log Aktivitas</span>
          </h2>
          <p className="text-xs text-slate-500">Log perubahan historis yang dilakukan oleh Super Admin untuk kontrol internal.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Cari kata kunci aktivitas (contoh: 'cetak', 'tambah')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Logs Feed Container */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl space-y-1">
            <ShieldAlert className="mx-auto text-slate-300" size={24} />
            <p className="font-semibold text-slate-700">Tidak ada log aktivitas ditemukan</p>
            <p className="text-xs">Ubah filter kata kunci pencarian Anda.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-3 hover:bg-slate-50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 text-[10px] uppercase font-bold rounded">
                    {log.action}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">oleh {log.adminUser}</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-tight">
                  {log.detail}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono text-slate-400">
                  {formatFullDate(log.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
