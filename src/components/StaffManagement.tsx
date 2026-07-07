/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  UserPlus, 
  UserMinus, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  Key, 
  User, 
  CheckCircle, 
  XCircle,
  Plus, 
  Shield, 
  RefreshCw,
  Search
} from "lucide-react";
import Swal from "sweetalert2";
import { StaffUser } from "../types";

interface StaffManagementProps {
  staffList: StaffUser[];
  activeUser: StaffUser | null;
  onAddStaff: (staff: StaffUser) => void;
  onUpdateStaff: (id: string, updated: StaffUser) => void;
  onDeleteStaff: (id: string) => void;
}

export default function StaffManagement({
  staffList,
  activeUser,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff
}: StaffManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Staf Kepegawaian");
  const [status, setStatus] = useState<"Aktif" | "Nonaktif">("Aktif");

  // Reset form inputs
  const resetForm = () => {
    setUsername("");
    setPassword("");
    setName("");
    setRole("Staf Kepegawaian");
    setStatus("Aktif");
    setEditingStaff(null);
    setIsFormOpen(false);
  };

  // Open for Edit
  const handleOpenEdit = (staff: StaffUser) => {
    setEditingStaff(staff);
    setUsername(staff.username);
    setPassword(staff.password || "");
    setName(staff.name);
    setRole(staff.role);
    setStatus(staff.status);
    setIsFormOpen(true);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !name.trim() || !password.trim()) {
      Swal.fire({
        title: "Perhatian",
        text: "Seluruh bidang isian wajib dilengkapi!",
        icon: "warning",
        confirmButtonColor: "#4f46e5"
      });
      return;
    }

    // Check duplicate username if adding new
    if (!editingStaff) {
      const isExist = staffList.some(s => s.username === username.trim().toLowerCase());
      if (isExist) {
        Swal.fire({
          title: "Username Duplikat",
          text: `Username "${username}" sudah digunakan oleh staf lain. Silakan pilih username yang lain.`,
          icon: "error",
          confirmButtonColor: "#e11d48"
        });
        return;
      }
    }

    const payload: StaffUser = {
      id: editingStaff ? editingStaff.id : "staff-" + Date.now(),
      username: username.trim().toLowerCase(),
      password: password.trim(),
      name: name.trim(),
      role: role.trim(),
      status: status,
      createdAt: editingStaff?.createdAt || new Date().toISOString()
    };

    if (editingStaff) {
      onUpdateStaff(editingStaff.id, payload);
    } else {
      onAddStaff(payload);
    }

    resetForm();
  };

  // Filter staff list
  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" size={24} />
            Manajemen Akun Staf Kepegawaian
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola dan daftarkan akun operasional untuk staf yang diperkenankan mengakses sistem cetak SK Gaji Berkala.
          </p>
        </div>
        
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow inline-flex items-center gap-2 cursor-pointer self-start md:self-center"
        >
          <UserPlus size={16} />
          <span>Tambah Akun Staf</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Core List Panel */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filtering Panel */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3 shadow-none">
            <Search className="text-slate-400 shrink-0" size={18} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, username, atau peran staf..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-slate-700 text-xs w-full focus:outline-none focus:ring-0 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")} 
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-1.5"
              >
                Clear
              </button>
            )}
          </div>

          {/* List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStaff.length === 0 ? (
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                <Shield className="mx-auto mb-2 opacity-30 text-indigo-600" size={40} />
                <p className="text-sm font-bold text-slate-600">Tidak ada akun staf ditemukan</p>
                <p className="text-xs mt-1">Cobalah ubah kata kunci pencarian Anda atau tambahkan akun staf baru.</p>
              </div>
            ) : (
              filteredStaff.map((staff) => {
                const isActive = staff.status === "Aktif";
                const isCurrentUser = activeUser?.id === staff.id;
                const isDefaultAdmin = staff.username === "admin";

                return (
                  <div 
                    key={staff.id} 
                    className={`bg-white rounded-2xl p-5 border transition-all ${
                      isCurrentUser 
                        ? "border-indigo-300 shadow-md ring-1 ring-indigo-200/50" 
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold ${
                          isActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400"
                        }`}>
                          {staff.name.split(" ").filter(Boolean).slice(0,2).map(n => n[0]).join("")}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 leading-tight">
                            {staff.name}
                            {isCurrentUser && (
                              <span className="text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full font-extrabold font-mono tracking-wider">
                                Sesi Anda
                              </span>
                            )}
                          </h3>
                          <p className="text-[11px] text-slate-450 mt-0.5">{staff.role}</p>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        isActive 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                          : "bg-rose-50 text-rose-700 border border-rose-200/50"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-505 bg-emerald-500" : "bg-rose-500"}`} />
                        {staff.status}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-550 leading-relaxed font-sans">
                      <div>
                        <span className="block text-slate-400 font-medium font-mono uppercase tracking-wider text-[8px]">Username</span>
                        <span className="font-bold text-slate-705">@{staff.username}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-medium font-mono uppercase tracking-wider text-[8px]">Kata Sandi</span>
                        <span className="font-bold text-slate-705 select-all hover:text-indigo-600 cursor-help" title="Klik untuk memblok sandi">
                          {staff.password}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Dibuat: {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(staff)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Ubah rincian akun"
                        >
                          <Edit2 size={13} />
                        </button>
                        
                        <button
                          onClick={() => onDeleteStaff(staff.id)}
                          disabled={isDefaultAdmin || isCurrentUser}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDefaultAdmin || isCurrentUser 
                              ? "text-slate-200 cursor-not-allowed" 
                              : "text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          }`}
                          title={
                            isDefaultAdmin 
                              ? "Akun administrator utama tidak dapat dihapus." 
                              : isCurrentUser 
                                ? "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif." 
                                : "Hapus akun staf ini"
                          }
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Form Panel (Create / Edit) */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Key className="text-indigo-500" size={16} />
                {editingStaff ? "Ubah Akun Staf" : "Tambah Akun Baru"}
              </h3>
              {editingStaff && (
                <button 
                  onClick={resetForm}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md"
                >
                  Batal Ubah
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nama Lengkap */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nama Staf Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap & gelar staf"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-medium transition-colors"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Username Pengguna</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">@</span>
                  <input
                    type="text"
                    required
                    disabled={editingStaff?.username === "admin"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: nina_karlina"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 font-semibold transition-colors"
                  />
                </div>
              </div>

              {/* Kata Sandi */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kata Sandi (Min. 4 Karakter)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kata sandi akun"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Peran / Hak Akses */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Peran (Jabatan)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-medium transition-colors cursor-pointer"
                >
                  <option value="Staf Kepegawaian">Staf Kepegawaian</option>
                  <option value="Administrasi KCD Wilayah XIII">Administrasi KCD Wilayah XIII</option>
                  <option value="Kepala Cabang Dinas">Kepala Cabang Dinas</option>
                </select>
              </div>

              {/* Status Akun */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status Akun</label>
                <div className="flex gap-4 pt-1 select-none">
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={status === "Aktif"}
                      disabled={editingStaff?.username === "admin"}
                      onChange={() => setStatus("Aktif")}
                      className="text-indigo-600 focus:ring-indigo-500 rounded-full h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>Aktif</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={status === "Nonaktif"}
                      disabled={editingStaff?.username === "admin"}
                      onChange={() => setStatus("Nonaktif")}
                      className="text-indigo-600 focus:ring-indigo-500 rounded-full h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>Nonaktif</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm hover:shadow uppercase tracking-wider cursor-pointer"
                >
                  {editingStaff ? "Simpan Perubahan" : "Daftarkan Akun"}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
