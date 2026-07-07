/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Lock, 
  User, 
  ShieldAlert, 
  CheckCircle, 
  Fingerprint,
  Users2,
  Database,
  CloudLightning
} from "lucide-react";
import Swal from "sweetalert2";
import { Pegawai, SystemSettings, ActivityLog, StaffUser } from "./types";
import { initialPegawaiList, initialSystemSettings, initialActivityLogs, initialStaffUserList } from "./data/seedData";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import DatabaseGrid from "./components/DatabaseGrid";
import SKGBForm from "./components/SKGBForm";
import LaporanSKGB from "./components/LaporanSKGB";
import LogsPanel from "./components/LogsPanel";
import SettingsPanel from "./components/SettingsPanel";
import NotificationPanel from "./components/NotificationPanel";
import StaffManagement from "./components/StaffManagement";

import {
  getPegawaiFromFirestore,
  savePegawaiToFirestore,
  deletePegawaiFromFirestore,
  clearAllPegawaiFromFirestore,
  getSettingsFromFirestore,
  saveSettingsToFirestore,
  getLogsFromFirestore,
  saveLogToFirestore,
  getStaffFromFirestore,
  saveStaffToFirestore,
  deleteStaffFromFirestore
} from "./firebase";

export default function App() {
  // Authentication State (persistent)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("skgb_authenticated") === "true";
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Loading and Sync states
  const [isLoadingFromFirebase, setIsLoadingFromFirebase] = useState<boolean>(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Persistent App Databases (Loaded initially from local, then synchronized with Firebase Firestore)
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>(() => {
    const saved = localStorage.getItem("skgb_pegawai");
    return saved ? JSON.parse(saved) : initialPegawaiList;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem("skgb_settings");
    return saved ? JSON.parse(saved) : initialSystemSettings;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem("skgb_logs");
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });

  const [staffList, setStaffList] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem("skgb_staff");
    return saved ? JSON.parse(saved) : initialStaffUserList;
  });

  const [activeUser, setActiveUser] = useState<StaffUser | null>(() => {
    const saved = localStorage.getItem("skgb_active_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState("dashboard");
  // For selecting a specific pegawai to print
  const [selectedPegawaiForCetak, setSelectedPegawaiForCetak] = useState<Pegawai | null>(null);

  // 1. Initial Synchronisation with Google Firebase Firestore
  useEffect(() => {
    let containerActive = true;
    async function loadDataFromFirebase() {
      try {
        console.log("Menghubungkan ke Firebase Cloud Firestore...");
        
        // Fetch all essential datasets from cloud collections
        const remotePegawai = await getPegawaiFromFirestore();
        const remoteSettings = await getSettingsFromFirestore();
        const remoteLogs = await getLogsFromFirestore();
        const remoteStaff = await getStaffFromFirestore();

        if (containerActive) {
          setIsFirebaseConnected(true);

          if (remotePegawai && remotePegawai.length > 0) {
            setPegawaiList(remotePegawai);
            localStorage.setItem("skgb_pegawai", JSON.stringify(remotePegawai));
          } else {
            console.log("Firestore pegawai kosong, mengunggah data bawaan awal...");
            // Seed pegawai to Firestore if remote is blank
            for (const peg of initialPegawaiList) {
              await savePegawaiToFirestore(peg);
            }
          }

          if (remoteSettings) {
            setSettings(remoteSettings);
            localStorage.setItem("skgb_settings", JSON.stringify(remoteSettings));
          } else {
            console.log("Firestore settings kosong, mengunggah settings bawaan...");
            await saveSettingsToFirestore(initialSystemSettings);
          }

          if (remoteLogs && remoteLogs.length > 0) {
            setLogs(remoteLogs);
            localStorage.setItem("skgb_logs", JSON.stringify(remoteLogs));
          } else {
            console.log("Firestore logs kosong, mengunggah rekam aktivitas awal...");
            for (const log of initialActivityLogs) {
              await saveLogToFirestore(log);
            }
          }

          if (remoteStaff && remoteStaff.length > 0) {
            setStaffList(remoteStaff);
            localStorage.setItem("skgb_staff", JSON.stringify(remoteStaff));
            
            // Sync activeUser credentials if their info changed in remote
            const activeSaved = localStorage.getItem("skgb_active_user");
            if (activeSaved) {
              const parsedActive = JSON.parse(activeSaved);
              const upToDate = remoteStaff.find(s => s.id === parsedActive.id);
              if (upToDate) {
                setActiveUser(upToDate);
                localStorage.setItem("skgb_active_user", JSON.stringify(upToDate));
              }
            }
          } else {
            console.log("Firestore staff kosong, mengunggah staf bawaan awal...");
            for (const st of initialStaffUserList) {
              await saveStaffToFirestore(st);
            }
          }
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data dengan Firebase Firestore:", err);
        if (containerActive) {
          setIsFirebaseConnected(false);
        }
      } finally {
        if (containerActive) {
          setIsLoadingFromFirebase(false);
        }
      }
    }
    loadDataFromFirebase();
    return () => {
      containerActive = false;
    };
  }, []);

  // Backup sync state to LocalStorage for safety and instant response
  useEffect(() => {
    localStorage.setItem("skgb_pegawai", JSON.stringify(pegawaiList));
  }, [pegawaiList]);

  useEffect(() => {
    localStorage.setItem("skgb_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("skgb_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("skgb_staff", JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    if (activeUser) {
      localStorage.setItem("skgb_active_user", JSON.stringify(activeUser));
    } else {
      localStorage.removeItem("skgb_active_user");
    }
  }, [activeUser]);

  // Activity logger helper with Live Sync
  const handleLogActivity = async (action: string, detail: string, customUser?: string) => {
    const userToLog = customUser || activeUser?.name || "Super Admin";
    const newLog: ActivityLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      adminUser: userToLog,
      action,
      detail
    };
    setLogs((prev) => [newLog, ...prev]);
    await saveLogToFirestore(newLog);
  };

  // Login handler with SweetAlert2
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const userMatched = staffList.find(
      s => s.username === username.trim().toLowerCase() && s.password === password.trim()
    );

    if (userMatched) {
      if (userMatched.status !== "Aktif") {
        setLoginError("Akun Anda telah dinonaktifkan oleh administrator.");
        Swal.fire({
          title: "Sesi Ditangguhkan!",
          text: "Mohon hubungi penanggung jawab. Status akun Anda saat ini sedang dinonaktifkan.",
          icon: "error",
          confirmButtonText: "Mengerti",
          confirmButtonColor: "#e11d48",
        });
        return;
      }

      setIsAuthenticated(true);
      setActiveUser(userMatched);
      localStorage.setItem("skgb_authenticated", "true");
      localStorage.setItem("skgb_active_user", JSON.stringify(userMatched));
      setLoginError("");
      
      handleLogActivity("Log Masuk", `${userMatched.name} (${userMatched.role}) berhasil masuk ke dalam sistem.`, userMatched.name);

      // Beautiful SweetAlert Toast
      Swal.fire({
        title: "Sesi Aktif Diizinkan!",
        html: `Selamat datang kembali, <strong class="text-indigo-600">${userMatched.name}</strong>.<br><small class="text-slate-500 font-medium">Masuk sukses ke Sistem SKGB Pemprov Jabar KCD XIII</small>`,
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
        confirmButtonText: "Mulai Kelola",
        confirmButtonColor: "#4f46e5",
      });
    } else {
      setLoginError("Kombinasi ID Pengguna atau Kata Sandi salah.");
      // SweetAlert2 Error
      Swal.fire({
        title: "Akses Ditolak!",
        text: "Kombinasi ID Pengguna atau Password yang dimasukkan salah. Silakan coba lagi.",
        icon: "error",
        confirmButtonText: "Mengerti",
        confirmButtonColor: "#e11d48",
      });
    }
  };

  // Sign out handler with SweetAlert2 Confirmation
  const handleLogout = () => {
    Swal.fire({
      title: "Konfirmasi Log Keluar",
      text: "Apakah Anda yakin ingin mengakhiri sesi aktif instansi Anda?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Keluar!",
      cancelButtonText: "Batal tetap di Sini",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#475569",
    }).then((result) => {
      if (result.isConfirmed) {
        handleLogActivity("Log Keluar", `${activeUser?.name || "Super Admin"} keluar dari sesi aplikasi.`);
        setIsAuthenticated(false);
        setActiveUser(null);
        localStorage.removeItem("skgb_authenticated");
        localStorage.removeItem("skgb_active_user");
        setUsername("");
        setPassword("");

        Swal.fire({
          title: "Sesi Berakhir",
          text: "Anda telah aman keluar dari sistem.",
          icon: "info",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  // Staff Account CRUD synchronization with Google Firebase Firestore
  const handleAddStaff = async (newStaff: StaffUser) => {
    try {
      setStaffList((prev) => [newStaff, ...prev]);
      await saveStaffToFirestore(newStaff);
      handleLogActivity("Tambah Anggota Staf", `Mendaftarkan akun staf baru: ${newStaff.name} (Peran: ${newStaff.role}, @${newStaff.username}).`);
      
      Swal.fire({
        title: "Staf Didaftarkan!",
        html: `Akun <strong class="text-indigo-600">${newStaff.name}</strong> berhasil dibuat dan disinkronkan ke server Firebase.`,
        icon: "success",
        confirmButtonColor: "#4f46e5",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Kesalahan",
        text: "Gagal menyimpan akun ke database Firebase.",
        icon: "error"
      });
    }
  };

  const handleUpdateStaff = async (id: string, updated: StaffUser) => {
    try {
      setStaffList((prev) => prev.map((s) => (s.id === id ? updated : s)));
      await saveStaffToFirestore(updated);
      
      if (activeUser && activeUser.id === id) {
        setActiveUser(updated);
      }

      handleLogActivity("Ubah Rincian Staf", `Memperbarui rincian akun staf: ${updated.name} (@${updated.username}).`);
      
      Swal.fire({
        title: "Perubahan Disimpan!",
        html: `Akun staf <strong class="text-indigo-600">${updated.name}</strong> berhasil diperbarui.`,
        icon: "success",
        confirmButtonColor: "#4f46e5",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Kesalahan",
        text: "Gagal memperbarui rincian di server.",
        icon: "error"
      });
    }
  };

  const handleDeleteStaff = async (id: string) => {
    const staff = staffList.find((s) => s.id === id);
    if (!staff) return;

    if (staff.username === "admin") {
      Swal.fire({
        title: "Ditolak",
        text: "Akun Super Admin utama 'admin' tidak dapat didelete.",
        icon: "error"
      });
      return;
    }

    if (activeUser && activeUser.id === id) {
      Swal.fire({
        title: "Ditolak",
        text: "Anda tidak dapat menghapus akun Anda sendiri yang sedang log masuk.",
        icon: "error"
      });
      return;
    }

    Swal.fire({
      title: "Hapus Akun Staf",
      html: `Apakah Anda yakin ingin menghapus akun staf <strong class="text-rose-600">${staff.name}</strong> secara permanen?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#475569",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setStaffList((prev) => prev.filter((s) => s.id !== id));
          await deleteStaffFromFirestore(id);
          handleLogActivity("Hapus Anggota Staf", `Menghapus akun staf: ${staff.name} (@${staff.username}) secara permanen.`);
          
          Swal.fire({
            title: "Akun Dihapus!",
            text: "Akun telah aman dihapus dari server cloud Firebase.",
            icon: "success",
            confirmButtonColor: "#4f46e5"
          });
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: "Kesalahan",
            text: "Gagal menghapus dari database cloud.",
            icon: "error"
          });
        }
      }
    });
  };

  // Database controllers with interactive SweetAlert feedback and Cloud Sync
  const handleAddPegawai = async (newPeg: Pegawai) => {
    try {
      setPegawaiList((prev) => [newPeg, ...prev]);
      await savePegawaiToFirestore(newPeg);
      handleLogActivity("Tambah Pegawai", `Menambahkan pegawai baru bernama ${newPeg.nama} (NIP: ${newPeg.nip}).`);
      
      Swal.fire({
        title: "Pegawai Ditambahkan!",
        html: `Data pegawai <strong class="text-indigo-600">${newPeg.nama}</strong> berhasil disimpan dan disinkronkan secara permanen di database cloud Firebase.`,
        icon: "success",
        confirmButtonColor: "#4f46e5",
        confirmButtonText: "Selesai",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Galat Penyimpanan",
        text: "Data gagal dikirim ke Firestore. Sinkronisasi lokal tetap diaktifkan.",
        icon: "error",
        confirmButtonColor: "#e11d48"
      });
    }
  };

  const handleImportPegawaiBatch = async (newPegs: Pegawai[]) => {
    Swal.fire({
      title: "Mengimpor Data Pegawai...",
      html: "Sedang mengunggah dan mensinkronisasikan data ke database cloud Firebase. Mohon tunggu...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      for (const peg of newPegs) {
        await savePegawaiToFirestore(peg);
      }
      
      setPegawaiList((prev) => [...newPegs, ...prev]);
      handleLogActivity("Import Pegawai", `Berhasil mengimpor ${newPegs.length} data pegawai baru secara massal dari file Excel.`);
      
      Swal.fire({
        title: "Import Berhasil!",
        html: `Berhasil menyimpan dan mensinkronisasikan <strong>${newPegs.length} pegawai</strong> secara permanen ke database cloud Firebase.`,
        icon: "success",
        confirmButtonColor: "#4f46e5",
        confirmButtonText: "Selesai"
      });
    } catch (err) {
      console.error("Batch import error:", err);
      Swal.fire({
        title: "Kesalahan Import",
        text: "Gagal menyimpan seluruh data ke server cloud. Silakan coba lagi.",
        icon: "error",
        confirmButtonColor: "#e11d48"
      });
    }
  };

  const handleUpdatePegawai = async (id: string, updated: Pegawai, silent: boolean = false) => {
    try {
      setPegawaiList((prev) => prev.map((p) => (p.id === id ? updated : p)));
      await savePegawaiToFirestore(updated);
      handleLogActivity("Ubah Profil", `Mengubah profil rincian pegawai bernama ${updated.nama} (NIP: ${updated.nip}).`);
      
      if (!silent) {
        Swal.fire({
          title: "Pengubahan Disimpan!",
          html: `Profil pegawai <strong class="text-indigo-600">${updated.nama}</strong> berhasil diperbarui di database cloud server.`,
          icon: "success",
          confirmButtonColor: "#4f46e5",
          confirmButtonText: "Baik",
        });
      }
    } catch (err) {
      console.error(err);
      if (!silent) {
        Swal.fire({
          title: "Perubahan Gagal Sinkron",
          text: "Perubahan hanya diperbarui di penyimpanan lokal.",
          icon: "error",
          confirmButtonColor: "#e11d48"
        });
      }
    }
  };

  const handleDeletePegawai = (id: string) => {
    const peg = pegawaiList.find((p) => p.id === id);
    if (!peg) return;

    Swal.fire({
      title: "Konfirmasi Penghapusan",
      html: `Apakah Anda benar-benar yakin ingin menghapus data pegawai <strong class="text-rose-600">${peg.nama}</strong>? Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal Hapus",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#475569",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setPegawaiList((prev) => prev.filter((p) => p.id !== id));
          await deletePegawaiFromFirestore(id);
          handleLogActivity("Hapus Pegawai", `Menghapus data pegawai bernama ${peg.nama} (NIP: ${peg.nip}) secara permanen.`);

          Swal.fire({
            title: "Dihapus!",
            text: "Data pegawai telah dihapus secara permanen dari server cloud Firebase.",
            icon: "success",
            confirmButtonColor: "#4f46e5",
          });
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: "Kesalahan",
            text: "Gagal menghapus data di database cloud.",
            icon: "error",
            confirmButtonColor: "#4f46e5",
          });
        }
      }
    });
  };

  const handleClearAllPegawai = () => {
    Swal.fire({
      title: "Konfirmasi Hapus Semua Data",
      html: `Apakah Anda benar-benar yakin ingin menghapus <strong class="text-rose-600">SEMUA data pegawai</strong> di dalam tabel? <br><br>Semua rekam data pegawai akan dihapus permanen dari cloud Firestore dan tidak dapat dikembalikan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus Semua!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#475569",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Menghapus Semua Data...",
          html: "Sedang mengosongkan database cloud. Mohon tunggu...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        try {
          await clearAllPegawaiFromFirestore();
          setPegawaiList([]);
          handleLogActivity("Kosongkan Database", "Menghapus semua data pegawai dari sistem secara permanen.");
          
          Swal.fire({
            title: "Berhasil Dikosongkan!",
            text: "Seluruh data pegawai telah sukses dihapus dari database cloud.",
            icon: "success",
            confirmButtonColor: "#4f46e5",
          });
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: "Kesalahan",
            text: "Gagal mengosongkan database di cloud.",
            icon: "error",
            confirmButtonColor: "#e11d48",
          });
        }
      }
    });
  };

  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    try {
      setSettings(newSettings);
      await saveSettingsToFirestore(newSettings);
      handleLogActivity("Ubah Pengaturan", `Mengubah setelan sistem spesimen tanda tangan (${newSettings.spesimen.namaPejabat}).`);

      Swal.fire({
        title: "Konfigurasi Disimpan!",
        text: "Seluruh preferensi spesimen kop dinas, regulasi, dan TTE berhasil disinkronkan ke server Firebase.",
        icon: "success",
        confirmButtonColor: "#4f46e5",
        confirmButtonText: "Oke",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Pengecualian Gagal",
        text: "Pengaturan hanya disimpan di peramban internet lokal.",
        icon: "error"
      });
    }
  };

  // Action callback to move user directly to printer after picking an employee
  const handleSelectPegawaiForSKGB = (pegawai: Pegawai) => {
    setSelectedPegawaiForCetak(pegawai);
    setCurrentTab("cetak-skgb");
  };

  // Beautiful global loading state on initial database hydration
  if (isLoadingFromFirebase) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-24 h-24 border-4 border-indigo-500/20 rounded-full animate-ping"></div>
          <div className="absolute w-20 h-20 border-t-4 border-l-4 border-indigo-400 rounded-full animate-spin"></div>
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl relative">
            <Database size={24} className="animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">Menghubungkan Database Cloud</h2>
        <p className="text-slate-400 text-xs mt-2 max-w-sm leading-relaxed">
          Sedang menyinkronkan data SKGB dengan server Firebase Firestore terproteksi Wilayah XIII Provinsi Jawa Barat...
        </p>
        <div className="mt-6 flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-[10px] font-semibold text-indigo-300">
          <CloudLightning size={12} />
          <span>Google Cloud Run & Firestore Secured Session</span>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard Layout
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-slate-50 font-sans print:bg-white text-slate-800">
        
        {/* Navigation Sidebar */}
        <Navbar 
          currentTab={currentTab} 
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            // clear selected printing employee on manual navigating if desired, or keep
          }} 
          onLogout={handleLogout} 
          activeUser={activeUser}
        />

        {/* Core Screen Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto print:p-0 print:overflow-visible">
          
          {/* TAB 1: DASHBOARD */}
          {currentTab === "dashboard" && (
            <Dashboard 
              pegawaiList={pegawaiList} 
              logs={logs} 
              onNavigateToTab={setCurrentTab}
              onSelectPegawaiForSKGB={handleSelectPegawaiForSKGB}
            />
          )}

          {/* TAB 2: DATA PEGAWAI (DATABASE CONTROL LIST) */}
          {currentTab === "database" && (
            <DatabaseGrid 
              pegawaiList={pegawaiList}
              onAddPegawai={handleAddPegawai}
              onImportPegawaiBatch={handleImportPegawaiBatch}
              onUpdatePegawai={handleUpdatePegawai}
              onDeletePegawai={handleDeletePegawai}
              onClearAllPegawai={handleClearAllPegawai}
              onSelectPegawaiForSKGB={handleSelectPegawaiForSKGB}
              settings={settings}
              onLogActivity={handleLogActivity}
            />
          )}

          {/* TAB 3: PRINT CENTRE & AUTOMATIONS CARDS */}
          {currentTab === "cetak-skgb" && (
            <SKGBForm 
              pegawaiList={pegawaiList}
              selectedPegawai={selectedPegawaiForCetak}
              onSelectPegawai={setSelectedPegawaiForCetak}
              settings={settings}
              onLogActivity={handleLogActivity}
            />
          )}

          {/* TAB: LAPORAN BULANAN/TAHUNAN */}
          {currentTab === "laporan" && (
            <LaporanSKGB 
              pegawaiList={pegawaiList}
              settings={settings}
            />
          )}

          {/* TAB 4: NOTIFICATIONS LISTS */}
          {currentTab === "notifikasi" && (
            <NotificationPanel 
              pegawaiList={pegawaiList}
            />
          )}

          {/* TAB 5: STAFF MANAGEMENT */}
          {currentTab === "manajemen-staf" && (
            <StaffManagement
              staffList={staffList}
              activeUser={activeUser}
              onAddStaff={handleAddStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          )}

          {/* TAB 6: AUDIT LOGS TRAIL */}
          {currentTab === "logs" && (
            <LogsPanel 
              logs={logs}
            />
          )}

          {/* TAB 7: SYSTEM PLIANCE SETTINGS */}
          {currentTab === "settings" && (
            <SettingsPanel 
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onLogActivity={handleLogActivity}
            />
          )}

        </main>
      </div>
    );
  }

  // Non-Authenticated Login Screen: Standard username/password login
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background decorations conforming to Slate & Indigo */}
      <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute left-0 bottom-0 -translate-x-1/3 translate-y-1/3 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl"></div>
      
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200/85 overflow-hidden relative z-10 transition-all">
        
        {/* Banner with West Jabar Emblem feel */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 pb-8 text-center relative border-b border-indigo-900/50">
          <div className="absolute top-4 right-4 text-indigo-300">
            <Fingerprint size={32} className="opacity-40 animate-pulse" />
          </div>
          
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg font-bold mb-3.5 border-2 border-white/40">
            <Users2 size={32} />
          </div>

          <h1 className="text-xl font-extrabold tracking-tight">Sistem SKGB Pemprov Jabar</h1>
          <p className="text-xs text-indigo-300 font-medium font-mono mt-1 uppercase tracking-widest">KCD WILAYAH XIII CIAMIS</p>
        </div>

        {/* Credentials Form Box */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium">
              Silakan masuk menggunakan akun koordinasi Kepegawaian Anda.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">ID Pengguna (Username)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ID Administrasi Anda"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Kata Sandi (Password)</label>
                <span className="text-[9px] text-indigo-600 bg-indigo-50 rounded pl-1 pr-1 font-bold">UTAMA</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Error notifications */}
            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold leading-normal flex items-start gap-2">
                <ShieldAlert size={14} className="shrink-0 mt-0.5 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-sm transition-all shadow-md cursor-pointer uppercase tracking-wider"
            >
              Masuk Sesi Admin
            </button>

          </form>

          {/* Quick login hint block */}
          <div className="pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 font-sans leading-normal">
            <p>Sandi Masuk Tambahan Demo:</p>
            <p className="font-mono mt-1 text-slate-600 font-semibold bg-slate-50 py-1 rounded border border-slate-100">
              User: <span className="text-indigo-600 font-bold">stafkepeg1</span> &nbsp;|&nbsp; Sandi: <span className="text-indigo-600 font-bold">staf123</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
