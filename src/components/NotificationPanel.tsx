/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import Swal from "sweetalert2";
import { 
  Bell, 
  Send, 
  Copy, 
  Check, 
  CalendarClock, 
  MessageSquare,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { Pegawai } from "../types";

interface NotificationPanelProps {
  pegawaiList: Pegawai[];
}

export default function NotificationPanel({ pegawaiList }: NotificationPanelProps) {
  
  // States
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPeg, setSelectedPeg] = useState<Pegawai | null>(null);
  const [customContactPhone, setCustomContactPhone] = useState("0265-771122");

  // Filter due list
  const dueList = pegawaiList.filter(p => p.statusKGB !== "Selesai");

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num) + ",-";
  };

  const formatFriendlyDate = (dateStr: string) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Generate dynamic notification message
  const generateMessage = (peg: Pegawai) => {
    return `Yth. Bapak/Ibu ${peg.nama},

Kami dari Cabang Dinas Pendidikan Wilayah XIII (Kepegawaian Pemprov Jabar) mengonfirmasi bahwa usulan Surat Keputusan Kenaikan Gaji Berkala (SKGB) Anda dengan TMT Baru *${formatFriendlyDate(peg.tmtBaru)}* telah berhasil diproses oleh sistem.

Rincian usulan Kenaikan Gaji Berkala :
- NIP : ${peg.nip}
- Gaji Pokok Baru : *${formatRupiah(peg.gajiPokokBaru)}*
- Masa Kerja Golongan : ${peg.mkTahunBaru} Tahun ${peg.mkBulanBaru} Bulan
- Unit Kerja : ${peg.unitKerja}

Salinan berkas fisik dan pindaian TTE digital Anda dapat segera diambil di Kantor Pelayanan Cabdisdik Wilayah XIII Ciamis atau dikoordinasikan melalui kepala tata usaha sekolah masing-masing.

Untuk informasi lebih lanjut, silakan hubungi kontak informasi layanan kepegawaian kami di nomor ${customContactPhone}.

Terima kasih atas pengabdian dan dedikasi luar biasa Anda bagi kemajuan pendidikan Jawa Barat.
_Cabdisdik XIII Jabar - Juara Lahir Batin_`;
  };

  const handleCopy = (peg: Pegawai) => {
    const text = generateMessage(peg);
    navigator.clipboard.writeText(text);
    setCopiedId(peg.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const formatWhatsAppNumber = (phoneStr?: string) => {
    if (!phoneStr) return "";
    // Clean all non-digit characters
    let cleaned = phoneStr.replace(/\D/g, "");
    // If starts with '0', replace with '62'
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.slice(1);
    }
    // If starts with '8', add '62'
    else if (cleaned.startsWith("8")) {
      cleaned = "62" + cleaned;
    }
    return cleaned;
  };

  const handleSendWhatsApp = (peg: Pegawai) => {
    const formattedNum = formatWhatsAppNumber(peg.noHp);
    const messageText = generateMessage(peg);
    
    if (formattedNum) {
      const url = `https://api.whatsapp.com/send?phone=${formattedNum}&text=${encodeURIComponent(messageText)}`;
      window.open(url, "_blank");
    } else {
      Swal.fire({
        title: "Nomor HP Tidak Ditemukan",
        text: `Pegawai ${peg.nama} belum memiliki nomor HP di database. Silakan masukkan nomor HP secara manual untuk mengirim via WhatsApp:`,
        input: "text",
        inputPlaceholder: "Contoh: 08123456789",
        showCancelButton: true,
        confirmButtonText: "Kirim via WhatsApp",
        cancelButtonText: "Batal",
        confirmButtonColor: "#10b981", // Emerald-500
        cancelButtonColor: "#64748b",
        inputValidator: (value) => {
          if (!value) {
            return "Nomor HP wajib diisi!";
          }
          if (!/^[0-9]+$/.test(value.replace(/[-+ ()]/g, ""))) {
            return "Masukkan nomor HP yang valid!";
          }
          return null;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const rawPhone = result.value;
          const cleanPhone = formatWhatsAppNumber(rawPhone);
          const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;
          window.open(url, "_blank");
        }
      });
    }
  };

  const isNearing = (status: string) => status === "Mendekati Jatuh Tempo";

  return (
    <div className="space-y-6">
      
      {/* Upper Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell size={20} className="text-indigo-600" />
              <span>Notifikasi Otomatis & Draf Pesan Kebijakan</span>
            </h2>
            <p className="text-xs text-slate-500">Kirim pemberitahuan atau salin draf notifikasi otomatis via WhatsApp kepada pendidik yang berkas KGB-nya sudah tiba.</p>
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-slate-500 font-semibold uppercase">Nomor Layanan Konten:</span>
            <input
              type="text"
              value={customContactPhone}
              onChange={(e) => setCustomContactPhone(e.target.value)}
              className="px-3 py-1 border border-slate-200 rounded-lg text-xs font-semibold max-w-[140px] focus:outline-none focus:border-indigo-500"
              placeholder="e.g. 0265-7171"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Anti-mager List of overdue employees (7/12 layout) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col h-[500px]">
          <h3 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
            <CalendarClock size={16} className="text-indigo-600" />
            <span>Karyawan Tertunggak KGB Baru</span>
          </h3>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 mt-2">
            {dueList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 space-y-2">
                <div className="p-3 bg-indigo-50/50 text-indigo-600 rounded-full">
                  <Check size={28} />
                </div>
                <p className="font-semibold text-slate-700">Semua Terkomunikasi Aman</p>
                <p className="text-xs">Tidak ada pegawai yang berstatus perlu penanganan pesan usulan KGB bulan ini.</p>
              </div>
            ) : (
              dueList.map((peg) => (
                <div 
                  key={peg.id} 
                  onClick={() => setSelectedPeg(peg)}
                  className={`p-3.5 rounded-xl transition-all duration-150 cursor-pointer flex justify-between items-center gap-4 ${
                    selectedPeg?.id === peg.id 
                      ? "bg-slate-100 border border-slate-300 shadow-xs" 
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-1 overflow-hidden">
                    <h4 className="font-semibold text-slate-900 text-sm truncate">{peg.nama}</h4>
                    <p className="text-slate-500 text-xs font-mono">{peg.nip} • {peg.unitKerja}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">TMT: <span className="font-bold text-slate-700">{formatFriendlyDate(peg.tmtBaru)}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                      isNearing(peg.statusKGB) 
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {peg.statusKGB}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(peg);
                      }}
                      className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-950 rounded-lg transition-colors cursor-pointer"
                      title="Salin Cepat"
                    >
                      {copiedId === peg.id ? <Check size={14} className="text-indigo-600 font-bold" /> : <Copy size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendWhatsApp(peg);
                      }}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-950 rounded-lg transition-colors cursor-pointer"
                      title="Kirim via WhatsApp"
                    >
                      <Send size={14} className="rotate-[45deg]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Composer View (5/12 layout) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-5 shadow-xl text-white flex flex-col h-[500px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-800 flex items-center gap-1.5">
            <MessageSquare size={14} className="text-indigo-400" />
            <span>Kamera Pratilik Teks Notifikasi</span>
          </h3>

          <div className="flex-1 overflow-y-auto mt-4 bg-slate-800 border border-slate-700 rounded-xl p-4 text-xs font-sans leading-relaxed text-slate-300 font-mono whitespace-pre-wrap select-all">
            {selectedPeg ? (
              generateMessage(selectedPeg)
            ) : dueList.length > 0 ? (
              "Klik salah satu nama pegawai di samping kiri untuk mengompilasi draf pesan notifikasi otomatis."
            ) : (
              "Harap pastikan ada pegawai yang perlu diproses dalam sistem untuk memonitor draf percakapan notifikasi otomatis."
            )}
          </div>

          {selectedPeg && (
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopy(selectedPeg)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-lg text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer"
              >
                {copiedId === selectedPeg.id ? (
                  <>
                    <Check size={14} />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Salin Draf</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSendWhatsApp(selectedPeg)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20"
              >
                <Send size={14} />
                <span>Kirim WhatsApp</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
