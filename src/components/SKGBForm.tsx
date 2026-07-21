/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Printer, 
  Search, 
  UserSquare2, 
  FileText, 
  Share2, 
  CheckCircle2, 
  RefreshCw, 
  Info,
  Calendar,
  Layers,
  Sparkles,
  ToggleLeft,
  ChevronRight,
  Plus,
  Minus,
  Download,
  ChevronDown,
  Check
} from "lucide-react";
import { Pegawai, SystemSettings, KepegawaianType } from "../types";
import Swal from "sweetalert2";
import PrintTemplate from "./PrintTemplate";
import { getSalaryByGolonganAndMasaKerja } from "../utils/salaryTable";

interface SKGBFormProps {
  pegawaiList: Pegawai[];
  selectedPegawai: Pegawai | null;
  onSelectPegawai?: (peg: Pegawai | null) => void;
  settings: SystemSettings;
  onLogActivity: (action: string, detail: string) => void;
}

export default function SKGBForm({ 
  pegawaiList, 
  selectedPegawai, 
  onSelectPegawai,
  settings,
  onLogActivity
}: SKGBFormProps) {
  
  // App states
  const [isManualInput, setIsManualInput] = useState(false);
  const [activePegId, setActivePegId] = useState("");
  const [lastLoadedPegId, setLastLoadedPegId] = useState("");
  
  // Searchable dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Handle click outside searchable dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".custom-select-container")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Custom document parameters
  const [nomorSurat, setNomorSurat] = useState("");
  const [tanggalSurat, setTanggalSurat] = useState("");
  
  // Manual Input Pegawai State
  const [manualPeg, setManualPeg] = useState<Pegawai>({
    id: "manual-active",
    nama: "WIKA NAJMUDIN, S.Pd.",
    tempatLahir: "TASIKMALAYA",
    tanggalLahir: "1981-09-05",
    nip: "198109052024211004",
    pangkatGolongan: "IX",
    pangkatGolonganBaru: "IX",
    jabatan: "GURU AHLI PERTAMA - PPKN",
    unitKerja: "SMKN CIMERAK KABUPATEN PANGANDARAN",
    gajiPokokLama: 3203600,
    skOlehPejabat: "GUBERNUR JAWA BARAT",
    skNomor: "Kep.208/KPG.02/PPIK/2024",
    skTanggal: "2024-02-29",
    skTglMulaiBerlaku: "2024-03-01",
    skMasaKerjaTahun: 0,
    skMasaKerjaBulan: 0,
    hasPMK: false,
    gajiPokokBaru: 3304400,
    mkTahunBaru: 2,
    mkBulanBaru: 0,
    tmtBaru: "2026-03-01",
    tmtAkanDatang: "2028-03-01",
    statusKGB: "Selesai"
  });

  // Tembusan state
  const [tembusanList, setTembusanList] = useState<string[]>([]);

  // Synchronize when selectedPegawai changes from database
  useEffect(() => {
    if (selectedPegawai) {
      setIsManualInput(false);
      const freshPeg = pegawaiList.find(p => p.id === selectedPegawai.id) || selectedPegawai;
      setActivePegId(freshPeg.id);
      
      if (freshPeg.id !== lastLoadedPegId) {
        setLastLoadedPegId(freshPeg.id);
        loadTembusanForPeg(freshPeg);
        setNomorSurat(freshPeg.noSuratBaru || settings.nomorSuratCounter);
        if (freshPeg.tglSuratBaru) {
          setTanggalSurat(freshPeg.tglSuratBaru);
        } else {
          const today = new Date();
          const y = today.getFullYear();
          const m = String(today.getMonth() + 1).padStart(2, '0');
          const d = String(today.getDate()).padStart(2, '0');
          setTanggalSurat(`${y}-${m}-${d}`);
        }
      }
    } else if (pegawaiList.length > 0) {
      const exists = pegawaiList.some(p => p.id === activePegId);
      if (!activePegId || (!exists && activePegId !== "manual")) {
        const defaultPeg = pegawaiList[0];
        setIsManualInput(false);
        setActivePegId(defaultPeg.id);
        setLastLoadedPegId(defaultPeg.id);
        loadTembusanForPeg(defaultPeg);
        setNomorSurat(defaultPeg.noSuratBaru || settings.nomorSuratCounter);
        if (defaultPeg.tglSuratBaru) {
          setTanggalSurat(defaultPeg.tglSuratBaru);
        } else {
          const today = new Date();
          const y = today.getFullYear();
          const m = String(today.getMonth() + 1).padStart(2, '0');
          const d = String(today.getDate()).padStart(2, '0');
          setTanggalSurat(`${y}-${m}-${d}`);
        }
      } else if (activePegId !== "manual" && activePegId !== lastLoadedPegId) {
        const freshPeg = pegawaiList.find(p => p.id === activePegId);
        if (freshPeg) {
          setLastLoadedPegId(freshPeg.id);
          loadTembusanForPeg(freshPeg);
          setNomorSurat(freshPeg.noSuratBaru || settings.nomorSuratCounter);
          if (freshPeg.tglSuratBaru) {
            setTanggalSurat(freshPeg.tglSuratBaru);
          } else {
            const today = new Date();
            const y = today.getFullYear();
            const m = String(today.getMonth() + 1).padStart(2, '0');
            const d = String(today.getDate()).padStart(2, '0');
            setTanggalSurat(`${y}-${m}-${d}`);
          }
        }
      }
    }
  }, [selectedPegawai, pegawaiList, settings, activePegId, lastLoadedPegId]);

  // Handle setting defaults
  useEffect(() => {
    // Default nomor surat
    if (!nomorSurat) {
      setNomorSurat(settings.nomorSuratCounter);
    }
    // Default tanggal surat: today's date formatted as YYYY-MM-DD
    if (!tanggalSurat) {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      setTanggalSurat(`${y}-${m}-${d}`);
    }
  }, [settings]);

  // Load tembusan defaults based on type of selected employee
  const loadTembusanForPeg = (peg: Pegawai) => {
    const isPNS = !["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(peg.pangkatGolongan);
    if (isPNS) {
      setTembusanList([
        "Kepala Dinas Pendidikan Provinsi Jawa Barat di Bandung;",
        "Kepala Badan Pengelolaan Keuangan dan Aset Daerah Provinsi Jawa Barat di Bandung;",
        "Kepala Sub Bagian Keuangan dan Aset Dinas Pendidikan Provinsi Jawa Barat di Bandung;",
        `${peg.unitKerja || "Kepala SMA/SMK Bersangkutan"};`,
        "Pegawai Yang bersangkutan untuk diketahui dan digunakan seperlunya."
      ]);
    } else {
      setTembusanList([
        "Kepala Dinas Pendidikan Provinsi Jawa Barat di Bandung;",
        "Kepala Badan Pengelolaan Keuangan dan Aset Daerah Provinsi Jawa Barat di Bandung;",
        "Kepala Subbag Tata Usaha Dinas Pendidikan Provinsi Jawa Barat di Bandung;",
        "Pegawai Yang bersangkutan. Untuk diketahui dan digunakan seperlunya."
      ]);
    }
  };

  // Switch employee details
  const handlePegawaiChange = (pId: string) => {
    if (pId === "manual") {
      setIsManualInput(true);
      setActivePegId("manual");
      setLastLoadedPegId("manual");
      if (onSelectPegawai) {
        onSelectPegawai(null);
      }
      loadTembusanForPeg(manualPeg);
      setNomorSurat(manualPeg.noSuratBaru || settings.nomorSuratCounter);
      if (manualPeg.tglSuratBaru) {
        setTanggalSurat(manualPeg.tglSuratBaru);
      }
    } else {
      setIsManualInput(false);
      setActivePegId(pId);
      const found = pegawaiList.find(p => p.id === pId);
      if (found && onSelectPegawai) {
        onSelectPegawai(found);
      }
    }
  };

  // Determine which employee object is active for preview/printing
  const activePegawai = isManualInput 
    ? manualPeg 
    : (pegawaiList.find(p => p.id === activePegId) || pegawaiList[0] || manualPeg);

  // Auto Calculations on Manual input changes
  const handleManualFieldChange = (field: keyof Pegawai, value: any) => {
    const updated = { ...manualPeg, [field]: value };
    
    // Automatically recalculate if base attributes change
    if (field === "skTglMulaiBerlaku" || field === "skMasaKerjaTahun" || field === "skMasaKerjaBulan" || field === "gajiPokokLama" || field === "hasPMK" || field === "pmkTahun" || field === "pmkBulan" || field === "pangkatGolongan" || field === "pangkatGolonganBaru") {
      const isPP = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(updated.pangkatGolongan);
      
      const yearsAdded = 2 + (updated.hasPMK ? Number(updated.pmkTahun || 0) : 0);
      const monthsAdded = (updated.hasPMK ? Number(updated.pmkBulan || 0) : 0);
      
      const calcYears = Number(updated.skMasaKerjaTahun || 0) + yearsAdded + Math.floor((Number(updated.skMasaKerjaBulan || 0) + monthsAdded) / 12);
      const calcMonths = (Number(updated.skMasaKerjaBulan || 0) + monthsAdded) % 12;

      updated.mkTahunBaru = calcYears;
      updated.mkBulanBaru = calcMonths;

      // Automatically lookup old and new salaries from 2024 database unless they edited the salary directly
      if ((field as string) !== "gajiPokokLama" && (field as string) !== "gajiPokokBaru") {
        const calculatedGajiLama = getSalaryByGolonganAndMasaKerja(updated.pangkatGolongan, Number(updated.skMasaKerjaTahun || 0));
        const calculatedGajiBaru = getSalaryByGolonganAndMasaKerja(updated.pangkatGolonganBaru || updated.pangkatGolongan, Number(updated.mkTahunBaru || 0));
        
        if (calculatedGajiLama > 0) {
          updated.gajiPokokLama = calculatedGajiLama;
        }
        if (calculatedGajiBaru > 0) {
          updated.gajiPokokBaru = calculatedGajiBaru;
        }
      } else if (field === "gajiPokokLama" && updated.gajiPokokLama > 0) {
        // Fallback or legacy manual increase if they manually key in a custom old salary instead of using database
        updated.gajiPokokBaru = getSalaryByGolonganAndMasaKerja(updated.pangkatGolonganBaru || updated.pangkatGolongan, Number(updated.mkTahunBaru || 0)) || Math.round(Number(updated.gajiPokokLama) * 1.0314 / 100) * 100;
      }

      if (updated.skTglMulaiBerlaku) {
        const oldTMT = new Date(updated.skTglMulaiBerlaku);
        if (!isNaN(oldTMT.getTime())) {
          const newTMT = new Date(updated.skTglMulaiBerlaku);
          newTMT.setFullYear(oldTMT.getFullYear() + 2);
          
          const y = newTMT.getFullYear();
          const m = String(newTMT.getMonth() + 1).padStart(2, '0');
          const d = String(newTMT.getDate()).padStart(2, '0');
          updated.tmtBaru = `${y}-${m}-${d}`;

          if (Number(updated.mkTahunBaru || 0) >= 32) {
            updated.tmtAkanDatang = "MAKSIMAL";
          } else {
            const nextTMT = new Date(updated.tmtBaru);
            nextTMT.setFullYear(nextTMT.getFullYear() + 2);
            const yExt = nextTMT.getFullYear();
            const mExt = String(nextTMT.getMonth() + 1).padStart(2, '0');
            const dExt = String(nextTMT.getDate()).padStart(2, '0');
            updated.tmtAkanDatang = `${yExt}-${mExt}-${dExt}`;
          }
        }
      }
    }
    
    setManualPeg(updated);
    // Reload if type changes
    if (field === "pangkatGolongan") {
      loadTembusanForPeg(updated);
    }
  };

  // Print function
  const handlePrint = () => {
    onLogActivity(
      "Cetak SKGB", 
      `Mengunduh/mencetak Surat Keputusan Kenaikan Gaji Berkala untuk ${activePegawai.nama} (NIP: ${activePegawai.nip}).`
    );

    try {
      if (window.self !== window.top) {
        Swal.fire({
          title: "Buka di Tab Baru Untuk Mencetak",
          html: `
            <div class="text-left text-xs text-slate-700 leading-relaxed space-y-3">
              <p>Mencetak langsung dari dalam <strong>Panel Pratinjau (Iframe)</strong> dibatasi oleh keamanan browser bawaan sehingga dialog cetak tidak dapat muncul.</p>
              <div class="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-950 font-semibold leading-relaxed">
                👉 Silakan klik tombol <strong>"Open in New Tab" / "Buka di Tab Baru"</strong> (ikon kotak dengan panah keluar di kanan atas) pada pratinjau ini, lalu cetak dari tab baru tersebut.
              </div>
            </div>
          `,
          icon: "warning",
          confirmButtonText: "Saya Mengerti",
          confirmButtonColor: "#4f46e5",
        });
        return;
      }
    } catch (e) {
      // safe fallback
    }

    window.print();
  };

  const handleDownloadPDF = () => {
    onLogActivity(
      "Unduh PDF SKGB", 
      `Mengunduh berkas PDF SKGB untuk ${activePegawai.nama} (NIP: ${activePegawai.nip}) secara instan.`
    );

    Swal.fire({
      title: "Membuat File PDF...",
      text: "Mohon tunggu sejenak, berkas PDF sedang di-render dengan kualitas tinggi.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const originalGetComputedStyle = window.getComputedStyle;
    const convertOklchToRgb = (colorStr: string): string => {
      if (!colorStr || typeof colorStr !== 'string') return colorStr;
      if (!colorStr.includes('oklch') && !colorStr.includes('oklab')) return colorStr;
      
      return colorStr.replace(/(oklch|oklab)\([^)]+\)/g, (match) => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = match;
            ctx.fillRect(0, 0, 1, 1);
            const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
            return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
          }
        } catch (e) {
          // fallback
        }
        return 'rgb(120, 120, 120)';
      });
    };

    const restoreStyle = () => {
      window.getComputedStyle = originalGetComputedStyle;
    };

    window.getComputedStyle = function(el, pseudo) {
      const style = originalGetComputedStyle.call(this, el, pseudo);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'getPropertyValue') {
            return function(propertyName: string) {
              const val = target.getPropertyValue(propertyName);
              return convertOklchToRgb(val);
            };
          }
          const val = Reflect.get(target, prop);
          if (typeof val === 'string') {
            return convertOklchToRgb(val);
          }
          if (typeof val === 'function') {
            return val.bind(target);
          }
          return val;
        }
      });
    };

    import("html2pdf.js").then((html2pdfModule) => {
      const html2pdf = html2pdfModule.default;
      const element = document.getElementById("skgb-form-preview-container");
      
      if (!element) {
        restoreStyle();
        Swal.fire({
          title: "Kesalahan",
          text: "Gagal menemukan area dokumen untuk diunduh.",
          icon: "error"
        });
        return;
      }

      const generatePDF = (currentScale: number) => {
        const opt = {
          margin: 0,
          filename: `SKGB_${activePegawai.nama.replace(/\s+/g, "_")}_${activePegawai.nip}.pdf`,
          image: { type: "jpeg" as const, quality: 0.98 },
          html2canvas: { 
            scale: currentScale, 
            useCORS: true,
            onclone: (clonedDoc: any) => {
              // Replace oklch/oklab color definitions in style elements to prevent html2canvas crashes
              const styleElements = clonedDoc.querySelectorAll('style');
              styleElements.forEach((styleEl: any) => {
                if (styleEl.textContent) {
                  styleEl.textContent = styleEl.textContent
                    .replace(/oklch\([^)]+\)/g, 'rgb(120, 120, 120)')
                    .replace(/oklab\([^)]+\)/g, 'rgb(120, 120, 120)')
                    .replace(/color-mix\([^)]+\)/g, 'rgb(120, 120, 120)');
                }
              });

              // Clean inline styles as well
              const allElements = clonedDoc.querySelectorAll('*');
              allElements.forEach((el: any) => {
                if (el.style) {
                  const styleAttr = el.getAttribute('style');
                  if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab') || styleAttr.includes('color-mix'))) {
                    const cleanStyle = styleAttr
                      .replace(/oklch\([^)]+\)/g, 'rgb(120, 120, 120)')
                      .replace(/oklab\([^)]+\)/g, 'rgb(120, 120, 120)')
                      .replace(/color-mix\([^)]+\)/g, 'rgb(120, 120, 120)');
                    el.setAttribute('style', cleanStyle);
                  }
                }
              });
            }
          },
          jsPDF: { 
            unit: "mm", 
            format: [215, 330] as [number, number], // Folio/F4 size
            orientation: "portrait" as const
          }
        };

        return html2pdf()
          .set(opt)
          .from(element)
          .save();
      };

      generatePDF(2.0)
        .then(() => {
          restoreStyle();
          Swal.fire({
            title: "PDF Berhasil Diunduh!",
            text: "Berkas PDF SKGB telah berhasil disimpan ke perangkat Anda.",
            icon: "success",
            confirmButtonColor: "#10b981"
          });
        })
        .catch((err: any) => {
          console.warn("PDF render attempt at scale 2.0 failed, retrying at scale 1.5...", err);
          generatePDF(1.5)
            .then(() => {
              restoreStyle();
              Swal.fire({
                title: "PDF Berhasil Diunduh!",
                text: "Berkas PDF SKGB berhasil diunduh dengan penyesuaian resolusi.",
                icon: "success",
                confirmButtonColor: "#10b981"
              });
            })
            .catch((retryErr: any) => {
              restoreStyle();
              console.error("All PDF render attempts failed:", retryErr);
              Swal.fire({
                title: "Gagal Membuat PDF",
                text: `Terjadi kesalahan teknis saat membuat berkas PDF: ${retryErr?.message || retryErr || "Unknown error"}. Silakan gunakan opsi 'Cetak Manual' di browser dan simpan sebagai PDF.`,
                icon: "error"
              });
            });
        });
    }).catch(err => {
      restoreStyle();
      console.error(err);
      Swal.fire({
        title: "Gagal Mengunduh",
        text: "Gagal memuat modul PDF generator.",
        icon: "error"
      });
    });
  };

  // Tembusan manipulations
  const handleTembusanChange = (index: number, val: string) => {
    const list = [...tembusanList];
    list[index] = val;
    setTembusanList(list);
  };

  const addTembusanLine = () => {
    setTembusanList([...tembusanList, "Tembusan baru selanjutnya;"]);
  };

  const removeTembusanLine = (index: number) => {
    setTembusanList(tembusanList.filter((_, idx) => idx !== index));
  };

  return (
    <div className="skgb-form-layout-grid grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: CONTROLS & FORM CONFIGURATIONS (5/12 on large screens) */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Printer size={20} className="text-indigo-600" />
            <span>Pusat Kendali Cetak SKGB</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Automasi pengisian arsip PDF kenaikan gaji berdasarkan database atau isian manual instan.</p>
        </div>

        {/* PROFILE SELECTOR BLOCK */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">Pilih Pegawai Dasar</label>
            <div className="relative custom-select-container">
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setSearchTerm("");
                }}
                className="w-full pl-3 pr-10 py-2.5 bg-white border border-slate-250 rounded-xl text-sm font-semibold text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer text-slate-900 flex items-center justify-between shadow-sm"
              >
                <span className="truncate">
                  {isManualInput 
                    ? "★ INPUT MANUAL BARU (Instan Tanpa DB)" 
                    : activePegId 
                      ? `${activePegawai?.nama || ""} (NIP: ${activePegawai?.nip || ""})` 
                      : "-- Pilih dari Database Pegawai --"}
                </span>
                <ChevronDown size={16} className="text-slate-500 shrink-0 ml-2" />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 slide-in-from-top-1 duration-100">
                  <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <Search size={14} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Cari nama atau NIP..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent text-xs border-none outline-none focus:ring-0 p-0 text-slate-800"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-[220px] overflow-y-auto py-1 text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        handlePegawaiChange("manual");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 flex items-center justify-between border-b border-slate-100 bg-indigo-50/30 ${isManualInput ? 'bg-indigo-50' : ''}`}
                    >
                      <span>★ INPUT MANUAL BARU (Instan Tanpa DB)</span>
                      {isManualInput && <Check size={14} className="text-indigo-600" />}
                    </button>

                    {pegawaiList.filter(peg => {
                      const nameMatch = (peg.nama || "").toLowerCase().includes(searchTerm.toLowerCase());
                      const nipMatch = (peg.nip || "").toLowerCase().includes(searchTerm.toLowerCase());
                      return nameMatch || nipMatch;
                    }).length === 0 ? (
                      <div className="px-3 py-3 text-xs text-slate-400 text-center italic">
                        Pegawai tidak ditemukan
                      </div>
                    ) : (
                      pegawaiList.filter(peg => {
                        const nameMatch = (peg.nama || "").toLowerCase().includes(searchTerm.toLowerCase());
                        const nipMatch = (peg.nip || "").toLowerCase().includes(searchTerm.toLowerCase());
                        return nameMatch || nipMatch;
                      }).map((peg) => {
                        const isSelected = !isManualInput && activePegId === peg.id;
                        return (
                          <button
                            key={peg.id}
                            type="button"
                            onClick={() => {
                              handlePegawaiChange(peg.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between text-slate-800 ${isSelected ? 'bg-indigo-50/50 font-bold text-indigo-900' : ''}`}
                          >
                            <div className="truncate">
                              <div className="font-semibold truncate text-slate-900">{peg.nama}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">NIP: {peg.nip}</div>
                            </div>
                            {isSelected && <Check size={14} className="text-indigo-600 shrink-0 ml-2" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 px-1">
            <Sparkles size={14} className="text-indigo-600 shrink-0" />
            <span>
              {isManualInput 
                ? "Sekarang Anda berada di mode manual. Input tidak akan masuk ke database utama." 
                : "Informasi kepangkatan, masa kerja, dan gaji pegawai bersangkutan disinkronkan secara real-time."}
            </span>
          </div>
        </div>

        {/* TABULATED CONTROL FIELDSETS */}
        <div className="space-y-4">
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Parameter Administrasi</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Surat (Agenda)</label>
                <input
                  type="text"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-250 rounded-lg text-sm font-mono focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Surat</label>
                <input
                  type="date"
                  value={tanggalSurat}
                  onChange={(e) => setTanggalSurat(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-250 rounded-lg text-sm focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC FORM FLAVOR: If manual is activated, show rich inputs inside scroll block */}
          {isManualInput ? (
            <div className="border border-indigo-100 p-4 rounded-xl bg-indigo-50/10 space-y-3.5 animate-in slide-in-from-top-2 duration-150">
              <h4 className="text-xs font-extrabold text-indigo-900 flex items-center gap-1">
                <UserSquare2 size={14} />
                <span>Rincian Isian Pegawai Manual</span>
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-600 block">Nama Pegawai & Gelar</label>
                  <input
                    type="text"
                    value={manualPeg.nama}
                    onChange={(e) => handleManualFieldChange("nama", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">NIP</label>
                  <input
                    type="text"
                    value={manualPeg.nip}
                    onChange={(e) => handleManualFieldChange("nip", e.target.value.replace(/\s+/g, ""))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded focus:outline-none focus:border-indigo-500 text-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Golongan Ruang</label>
                  <input
                    type="text"
                    value={manualPeg.pangkatGolongan}
                    onChange={(e) => handleManualFieldChange("pangkatGolongan", e.target.value.toUpperCase())}
                    placeholder="e.g. IX atau PENATA III/c"
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Golongan Ruang Baru</label>
                  <input
                    type="text"
                    value={manualPeg.pangkatGolonganBaru || manualPeg.pangkatGolongan}
                    onChange={(e) => handleManualFieldChange("pangkatGolonganBaru", e.target.value.toUpperCase())}
                    placeholder="e.g. X atau PENATA III/d"
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Jabatan</label>
                  <input
                    type="text"
                    value={manualPeg.jabatan}
                    onChange={(e) => handleManualFieldChange("jabatan", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Jabatan Baru</label>
                  <input
                    type="text"
                    value={manualPeg.jabatanBaru || manualPeg.jabatan}
                    onChange={(e) => handleManualFieldChange("jabatanBaru", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Unit Kerja</label>
                  <input
                    type="text"
                    value={manualPeg.unitKerja}
                    onChange={(e) => handleManualFieldChange("unitKerja", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Tempat Lahir</label>
                  <input
                    type="text"
                    value={manualPeg.tempatLahir}
                    onChange={(e) => handleManualFieldChange("tempatLahir", e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={manualPeg.tanggalLahir}
                    onChange={(e) => handleManualFieldChange("tanggalLahir", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded focus:outline-none focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Gaji Pokok Lama</label>
                  <input
                    type="number"
                    value={manualPeg.gajiPokokLama}
                    onChange={(e) => handleManualFieldChange("gajiPokokLama", Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded font-bold text-indigo-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Gaji Pokok Baru</label>
                  <input
                    type="number"
                    value={manualPeg.gajiPokokBaru}
                    onChange={(e) => handleManualFieldChange("gajiPokokBaru", Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded font-bold text-indigo-700"
                  />
                </div>

                <div className="col-span-2 border-t border-slate-200/60 pt-2.5 font-bold text-slate-700 text-[11px]">
                  B. Landasan Hukum SK Lama
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-600 block">Pejabat Pengambil Keputusan</label>
                  <input
                    type="text"
                    value={manualPeg.skOlehPejabat}
                    onChange={(e) => handleManualFieldChange("skOlehPejabat", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Nomor SK Lama</label>
                  <input
                    type="text"
                    value={manualPeg.skNomor}
                    onChange={(e) => handleManualFieldChange("skNomor", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Tanggal SK Terbit</label>
                  <input
                    type="date"
                    value={manualPeg.skTanggal}
                    onChange={(e) => handleManualFieldChange("skTanggal", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">TMT Mulai Gaji Lama</label>
                  <input
                    type="date"
                    value={manualPeg.skTglMulaiBerlaku}
                    onChange={(e) => handleManualFieldChange("skTglMulaiBerlaku", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Masa Kerja (Th/Bl)</label>
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="number"
                      placeholder="Th"
                      value={manualPeg.skMasaKerjaTahun}
                      onChange={(e) => handleManualFieldChange("skMasaKerjaTahun", Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded"
                    />
                    <input
                      type="number"
                      placeholder="Bl"
                      value={manualPeg.skMasaKerjaBulan}
                      onChange={(e) => handleManualFieldChange("skMasaKerjaBulan", Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded"
                    />
                  </div>
                </div>

                <div className="col-span-2 border-t border-slate-200/60 pt-2.5">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="manualPMKCheck"
                      checked={manualPeg.hasPMK}
                      onChange={(e) => handleManualFieldChange("hasPMK", e.target.checked)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-505"
                    />
                    <label htmlFor="manualPMKCheck" className="font-bold text-indigo-950 cursor-pointer">
                      Ada PMK (Penambahan Masa Kerja)
                    </label>
                  </div>
                </div>

                {manualPeg.hasPMK && (
                  <>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Nomor SK PMK</label>
                      <input
                        type="text"
                        value={manualPeg.pmkNomor || ""}
                        onChange={(e) => handleManualFieldChange("pmkNomor", e.target.value)}
                        placeholder="e.g. SK-PMK-002"
                        className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">Tanggal SK PMK</label>
                      <input
                        type="date"
                        value={manualPeg.pmkTanggal || ""}
                        onChange={(e) => handleManualFieldChange("pmkTanggal", e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">PMK Tambah Tahun</label>
                      <input
                        type="number"
                        value={manualPeg.pmkTahun || 0}
                        onChange={(e) => handleManualFieldChange("pmkTahun", Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block">PMK Tambah Bulan</label>
                      <input
                        type="number"
                        value={manualPeg.pmkBulan || 0}
                        onChange={(e) => handleManualFieldChange("pmkBulan", Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded"
                      />
                    </div>
                  </>
                )}

                <div className="col-span-2 border-t border-slate-200/60 pt-2.5 font-bold text-slate-700 text-[11px] uppercase">
                  C. Rincian KGB Baru (Hasil Kalkulasi)
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">TMT KGB Baru</label>
                  <input
                    type="date"
                    value={manualPeg.tmtBaru}
                    onChange={(e) => handleManualFieldChange("tmtBaru", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded font-sans font-semibold text-emerald-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Masa Kerja Baru (Th/Bl)</label>
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="number"
                      placeholder="Th"
                      value={manualPeg.mkTahunBaru}
                      onChange={(e) => handleManualFieldChange("mkTahunBaru", Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded font-semibold text-slate-805"
                    />
                    <input
                      type="number"
                      placeholder="Bl"
                      value={manualPeg.mkBulanBaru}
                      onChange={(e) => handleManualFieldChange("mkBulanBaru", Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded font-semibold text-slate-805"
                    />
                  </div>
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-600 block">Kenaikan Gaji Berkala Berikutnya (YAD)</label>
                  <input
                    type="date"
                    value={manualPeg.tmtAkanDatang}
                    onChange={(e) => handleManualFieldChange("tmtAkanDatang", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded font-sans font-semibold text-slate-805"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* DATABASE SUMMARY INFO BLOCK */
            <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-4 text-xs space-y-2.5 leading-relaxed text-slate-700">
              <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                <FileText size={15} />
                <span>Ringkasan Karakteristik Pegawai</span>
              </div>
              <ul className="space-y-1 list-disc list-inside">
                <li>Nama: <span className="font-bold text-slate-800">{activePegawai.nama}</span></li>
                <li>NIP: <span className="font-mono text-slate-800 font-semibold">{activePegawai.nip}</span></li>
                <li>Golongan: <span className="font-bold uppercase text-slate-900">{activePegawai.pangkatGolongan}</span></li>
                <li>Gaji Pokok Lama: <span className="font-semibold text-slate-800">Rp {activePegawai.gajiPokokLama.toLocaleString("id-ID")}</span></li>
                <li>Masa Kerja Baru: <span className="font-bold text-indigo-800">{activePegawai.mkTahunBaru} Th {activePegawai.mkBulanBaru} Bl</span></li>
              </ul>
            </div>
          )}

          {/* COPIES (TEMBUSAN) MANAGER */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Kelola Alur Tembusan</h3>
              <button
                type="button"
                onClick={addTembusanLine}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-bold inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-105 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={12} />
                <span>Baris Baru</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto p-1 border border-slate-100 rounded-lg">
              {tembusanList.map((item, id) => (
                <div key={id} className="flex gap-2 items-center">
                  <span className="text-xs font-mono text-slate-400 w-4 font-semibold">{id + 1}.</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleTembusanChange(id, e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded focus:border-indigo-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeTembusanLine(id)}
                    className="p-1 px-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PRINT TRIGGER BUTTONS */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
          <button
            onClick={handlePrint}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Printer size={14} />
            <span>Cetak Manual (Dialog Browser)</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer inline-flex items-center justify-center space-x-2 animate-pulse-subtle"
          >
            <Download size={16} />
            <span>Unduh PDF Langsung (.pdf) - REKOMENDASI</span>
          </button>
          
          <p className="text-[10px] text-center text-slate-400 font-medium leading-relaxed">
            Mendukung pengunduhan berkas PDF secara instan, atau pencetakan fisik langsung ke printer dengan margin F4 / Folio yang presisi dan rapi.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: DOCUMENT HIGH-FIDELITY SCROLL VIEW PREVIEW (7/12 on large screens) */}
      <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col h-[78vh] lg:h-[82vh] overflow-hidden sticky top-8 print:relative print:top-0 print:p-0 print:block print:h-auto print:shadow-none print:bg-white print:border-none">
        
        {/* Preview Control Headers */}
        <div className="flex justify-between items-center mb-4 text-white print:hidden">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></span>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Kamera Monitor Dokumen F4 / Folio</h3>
              <p className="text-[10px] text-slate-400">Bentuk dan format di bawah mencerminkan hasil cetak fisik secara presisi.</p>
            </div>
          </div>

          <div className="text-xs px-2.5 py-1 bg-slate-800 border border-slate-700 text-amber-300 rounded font-bold uppercase tracking-wider">
            {activePegawai.pangkatGolongan.includes("/") || activePegawai.pangkatGolongan.includes("PENATA") ? "PNS Template" : "PPPK Template"}
          </div>
        </div>

        {/* Scrollable container with high contrast margins resembling F4/Folio print sheet */}
        <div className="flex-1 overflow-auto bg-slate-800 p-2.5 md:p-6 rounded-xl flex justify-center print:p-0 print:block print:bg-white print:static print:overflow-visible">
          <div className="print:m-0 shrink-0 shadow-lg transform scale-90 md:scale-95 xl:scale-100 origin-top print:scale-100 print:transform-none">
            <div id="skgb-form-preview-container">
              <PrintTemplate
                pegawai={activePegawai}
                settings={settings}
                nomorSurat={nomorSurat}
                tanggalSurat={tanggalSurat}
                tembusanList={tembusanList}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
