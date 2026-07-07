/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  FileText, 
  UserPlus, 
  X, 
  ChevronRight, 
  Info,
  SlidersHorizontal,
  RefreshCw,
  Phone,
  Mail,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Check,
  AlertTriangle,
  Paperclip,
  Upload,
  Eye,
  Printer
} from "lucide-react";
import { Pegawai, KepegawaianType, SystemSettings } from "../types";
import * as XLSX from "xlsx";
import { getSalaryByGolonganAndMasaKerja } from "../utils/salaryTable";
import PrintTemplate from "./PrintTemplate";
import SearchableSelect from "./SearchableSelect";

// Helper to determine if a pegawai profile is complete and ready to print
const isDataLengkap = (peg: Pegawai): { valid: boolean; missingFields: string[] } => {
  const missing: string[] = [];
  if (!peg.nama?.trim()) missing.push("Nama Lengkap");
  if (!peg.nip?.trim() || peg.nip.trim().length < 5) missing.push("NIP");
  if (!peg.tempatLahir?.trim()) missing.push("Tempat Lahir");
  if (!peg.tanggalLahir?.trim()) missing.push("Tanggal Lahir");
  if (!peg.pangkatGolongan?.trim()) missing.push("Pangkat/Golongan");
  if (!peg.jabatan?.trim()) missing.push("Jabatan");
  if (!peg.unitKerja?.trim()) missing.push("Unit Kerja");
  if (!peg.gajiPokokLama) missing.push("Gaji Pokok Lama");
  
  if (!peg.skOlehPejabat?.trim()) missing.push("Pejabat Pengesah SK Lama");
  if (!peg.skNomor?.trim()) missing.push("Nomor SK Lama");
  if (!peg.skTanggal?.trim()) missing.push("Tanggal Terbit SK Lama");
  if (!peg.skTglMulaiBerlaku?.trim()) missing.push("TMT Gaji Lama");
  
  if (!peg.gajiPokokBaru) missing.push("Gaji Pokok Baru");
  if (!peg.tmtBaru?.trim()) missing.push("TMT KGB Baru");
  if (!peg.tmtAkanDatang?.trim()) missing.push("TMT KGB YAD");
  
  return {
    valid: missing.length === 0,
    missingFields: missing
  };
};

interface DatabaseGridProps {
  pegawaiList: Pegawai[];
  onAddPegawai: (pegawai: Pegawai) => void;
  onImportPegawaiBatch?: (pegawaiList: Pegawai[]) => Promise<void>;
  onUpdatePegawai: (id: string, updated: Pegawai, silent?: boolean) => void;
  onDeletePegawai: (id: string) => void;
  onClearAllPegawai?: () => void;
  onSelectPegawaiForSKGB: (pegawai: Pegawai) => void;
  settings: SystemSettings;
  onLogActivity: (action: string, detail: string) => void;
}

export default function DatabaseGrid({ 
  pegawaiList, 
  onAddPegawai, 
  onImportPegawaiBatch,
  onUpdatePegawai, 
  onDeletePegawai, 
  onClearAllPegawai,
  onSelectPegawaiForSKGB,
  settings,
  onLogActivity
}: DatabaseGridProps) {
  
  // Selection state for bulk printing
  const [selectedPegawaiIds, setSelectedPegawaiIds] = useState<string[]>([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"All" | "PNS" | "PPPK" | "PerluProses">("All");

  // Add/Edit Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);

  // Import State Hooks
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Field States
  const [nama, setNama] = useState("");
  const [nip, setNip] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [pangkatGolongan, setPangkatGolongan] = useState("IX");
  const [jabatan, setJabatan] = useState("");
  const [unitKerja, setUnitKerja] = useState("");
  const [gajiPokokLama, setGajiPokokLama] = useState(0);
  const [noHp, setNoHp] = useState("");
  const [email, setEmail] = useState("");

  const [skOlehPejabat, setSkOlehPejabat] = useState("");
  const [skNomor, setSkNomor] = useState("");
  const [skTanggal, setSkTanggal] = useState("");
  const [skTglMulaiBerlaku, setSkTglMulaiBerlaku] = useState("");
  const [skMasaKerjaTahun, setSkMasaKerjaTahun] = useState(0);
  const [skMasaKerjaBulan, setSkMasaKerjaBulan] = useState(0);

  const [hasPMK, setHasPMK] = useState(false);
  const [pmkTahun, setPmkTahun] = useState(0);
  const [pmkBulan, setPmkBulan] = useState(0);
  const [pmkNomor, setPmkNomor] = useState("");
  const [pmkTanggal, setPmkTanggal] = useState("");

  const [gajiPokokBaru, setGajiPokokBaru] = useState(0);
  const [pangkatGolonganBaru, setPangkatGolonganBaru] = useState("");
  const [jabatanBaru, setJabatanBaru] = useState("");
  const [noSuratBaru, setNoSuratBaru] = useState("");
  const [tglSuratBaru, setTglSuratBaru] = useState("");
  const [mkTahunBaru, setMkTahunBaru] = useState(0);
  const [mkBulanBaru, setMkBulanBaru] = useState(0);
  const [tmtBaru, setTmtBaru] = useState("");
  const [tmtAkanDatang, setTmtAkanDatang] = useState("");

  // Direct print preview modal states
  const [directPrintPegawai, setDirectPrintPegawai] = useState<Pegawai | null>(null);
  const [directNomorSurat, setDirectNomorSurat] = useState("");
  const [directTanggalSurat, setDirectTanggalSurat] = useState("");
  const [directTembusanList, setDirectTembusanList] = useState<string[]>([]);

  React.useEffect(() => {
    if (mkTahunBaru >= 32 && tmtAkanDatang !== "MAKSIMAL") {
      setTmtAkanDatang("MAKSIMAL");
    }
  }, [mkTahunBaru]);

  React.useEffect(() => {
    if (!jabatan) return;
    
    const isGuru = jabatan.toUpperCase().includes("GURU");
    const oldGol = pangkatGolongan.toUpperCase();
    const newGol = pangkatGolonganBaru.toUpperCase();
    
    if (isGuru) {
      const isOld3B = oldGol.includes("III/B") || oldGol.includes("3B");
      const isNew3C = newGol.includes("III/C") || newGol.includes("3C");
      const isOld3D = oldGol.includes("III/D") || oldGol.includes("3D");
      const isNew4A = newGol.includes("IV/A") || newGol.includes("4A");

      // 1. 3B to 3C -> Guru Ahli Pertama to Guru Ahli Muda
      if (isOld3B && isNew3C) {
        setJabatanBaru("GURU AHLI MUDA");
      }
      // 2. 3D to 4A -> Guru Ahli Muda to Guru Ahli Madya
      else if (isOld3D && isNew4A) {
        setJabatanBaru("GURU AHLI MADYA");
      }
      // 3. For any other change, if the current jabatanBaru is either empty or matching standard tags, reset/keep in sync
      else if (!jabatanBaru || jabatanBaru === jabatan || jabatanBaru === "GURU AHLI MUDA" || jabatanBaru === "GURU AHLI MADYA" || jabatanBaru === "GURU AHLI PERTAMA") {
        setJabatanBaru(jabatan);
      }
    } else {
      // Pelaksana / Tata Usaha staff - keep in sync if empty or unchanged
      if (!jabatanBaru || jabatanBaru === jabatan) {
        setJabatanBaru(jabatan);
      }
    }
  }, [pangkatGolongan, pangkatGolonganBaru, jabatan]);

  const [formType, setFormType] = useState<KepegawaianType>(KepegawaianType.PNS);
  const [formActiveTab, setFormActiveTab] = useState<"pribadi" | "sk" | "pmk" | "baru">("pribadi");

  // Standard Pangkat list for helpers
  const listPangkatPNS = [
    "JURU MUDA, I/a",
    "JURU MUDA Tk. I, I/b",
    "JURU, I/c",
    "JURU Tk. I, I/d",
    "PENGATUR MUDA, II/a",
    "PENGATUR MUDA Tk. I, II/b",
    "PENGATUR, II/c",
    "PENGATUR Tk. I, II/d",
    "PENATA MUDA, III/a",
    "PENATA MUDA Tk. I, III/b",
    "PENATA, III/c",
    "PENATA Tk. I, III/d",
    "PEMBINA, IV/a",
    "PEMBINA Tk. I, IV/b",
    "PEMBINA UTAMA MUDA, IV/c",
    "PEMBINA UTAMA MADYA, IV/d",
    "PEMBINA UTAMA, IV/e"
  ];

  const listGolonganPPPK = [
    "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII"
  ];

  // Helper to prefill when changing KepegawaianType
  const handleTypeChange = (type: KepegawaianType) => {
    setFormType(type);
    if (type === KepegawaianType.PPPK) {
      setPangkatGolongan("IX");
      setPangkatGolonganBaru("IX");
    } else {
      setPangkatGolongan("PENATA Tk. I, III/d");
      setPangkatGolonganBaru("PENATA Tk. I, III/d");
    }
  };

  const handleUploadKgbFile = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 3MB
    if (file.size > 3 * 1024 * 1024) {
      Swal.fire({
        title: "Ukuran Berkas Terlalu Besar!",
        text: "Maksimal ukuran berkas yang diperbolehkan adalah 3 MB.",
        icon: "error",
        confirmButtonColor: "#e11d48"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const peg = pegawaiList.find((p) => p.id === id);
      if (!peg) return;

      const updated: Pegawai = {
        ...peg,
        kgbFileUrl: base64,
        kgbFileName: file.name,
        kgbUploadedAt: new Date().toISOString(),
        statusKGB: "Selesai" // Mark as finished when file is uploaded
      };

      try {
        onUpdatePegawai(id, updated);
        Swal.fire({
          title: "Dokumen Berhasil Diunggah!",
          html: `Berkas <strong class="text-emerald-600">${file.name}</strong> berhasil diarsipkan dan status KGB guru ini diubah menjadi <strong class="text-indigo-600">Selesai</strong>.`,
          icon: "success",
          confirmButtonColor: "#10b981"
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Gagal Mengunggah Berkas",
          text: "Terjadi kesalahan saat menyimpan berkas ke server database cloud.",
          icon: "error",
          confirmButtonColor: "#e11d48"
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePreviewKgbFile = (peg: Pegawai) => {
    if (!peg.kgbFileUrl) return;

    const isPdf = peg.kgbFileUrl.startsWith("data:application/pdf");
    const isImage = peg.kgbFileUrl.startsWith("data:image/");

    let htmlContent = "";
    if (isPdf) {
      htmlContent = `<iframe src="${peg.kgbFileUrl}" class="w-full h-[520px] border border-slate-200 rounded-xl shadow-inner"></iframe>`;
    } else if (isImage) {
      htmlContent = `<div class="max-h-[520px] overflow-y-auto rounded-xl border border-slate-100 flex justify-center bg-slate-50 p-2 shadow-inner"><img src="${peg.kgbFileUrl}" alt="Arsip KGB" class="max-w-full h-auto rounded-md shadow-sm" /></div>`;
    } else {
      htmlContent = `<div class="p-6 text-center text-slate-500 font-medium">Pratinjau tidak didukung untuk tipe berkas ini. Silakan unduh langsung berkas tersebut.</div>`;
    }

    Swal.fire({
      title: `<span class="text-sm font-extrabold text-slate-800 font-sans block truncate max-w-md">Arsip KGB Sah: ${peg.nama}</span>`,
      html: `
        <div class="text-left mb-3.5 select-none bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <p class="text-xs text-slate-500 font-sans">NIP Pegawai: <strong class="text-slate-800 font-mono">${peg.nip}</strong></p>
          <p class="text-xs text-slate-500 font-sans mt-0.5">Nama Berkas: <strong class="text-slate-700">${peg.kgbFileName || "Dokumen_KGB.pdf"}</strong></p>
          <p class="text-xs text-slate-500 font-sans mt-0.5">Diunggah Pada: <strong class="text-slate-700">${new Date(peg.kgbUploadedAt || "").toLocaleString("id-ID")}</strong></p>
        </div>
        ${htmlContent}
      `,
      showCancelButton: true,
      confirmButtonText: "Unduh Dokumen",
      cancelButtonText: "Tutup Pratinjau",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#64748b",
      width: "850px"
    }).then((result) => {
      if (result.isConfirmed) {
        const link = document.createElement("a");
        link.href = peg.kgbFileUrl!;
        link.download = peg.kgbFileName || `KGB_Sah_${peg.nip}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  const handleDeleteKgbFile = (peg: Pegawai) => {
    Swal.fire({
      title: "Hapus Arsip Berkas?",
      html: `Apakah Anda yakin ingin menghapus berkas KGB sah untuk <strong class="text-slate-800">${peg.nama}</strong>? Status KGB akan otomatis diturunkan kembali menjadi tidak selesai.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#475569"
    }).then((result) => {
      if (result.isConfirmed) {
        // Determine automatic status
        const today = new Date("2026-06-16");
        const tmtDate = new Date(peg.tmtBaru || "2026-06-16");
        const diffTime = tmtDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let newStatus: "Selesai" | "Perlu Diproses" | "Mendekati Jatuh Tempo" | "Belum Selesai" = "Belum Selesai";
        if (diffDays <= 0) {
          newStatus = "Belum Selesai";
        } else if (diffDays <= 90) {
          newStatus = "Mendekati Jatuh Tempo";
        } else {
          newStatus = "Perlu Diproses";
        }

        const updated: Pegawai = {
          ...peg,
          kgbFileUrl: undefined,
          kgbFileName: undefined,
          kgbUploadedAt: undefined,
          statusKGB: newStatus
        };

        onUpdatePegawai(peg.id, updated);
        Swal.fire({
          title: "Arsip Dihapus",
          text: "Berkas arsip KGB sah berhasil dihapus dari server.",
          icon: "success",
          confirmButtonColor: "#4f46e5"
        });
      }
    });
  };

  const handleOpenDirectPrint = (peg: Pegawai) => {
    setDirectPrintPegawai(peg);
    setDirectNomorSurat(peg.noSuratBaru || settings.nomorSuratCounter);
    
    if (peg.tglSuratBaru) {
      setDirectTanggalSurat(peg.tglSuratBaru);
    } else {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      setDirectTanggalSurat(`${y}-${m}-${d}`);
    }

    // Load default tembusan
    const isPNS = !["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(peg.pangkatGolongan);
    if (isPNS) {
      setDirectTembusanList([
        "Kepala Dinas Pendidikan Provinsi Jawa Barat di Bandung;",
        "Kepala Badan Pengelolaan Keuangan dan Aset Daerah Provinsi Jawa Barat di Bandung;",
        "Kepala Sub Bagian Keuangan dan Aset Dinas Pendidikan Provinsi Jawa Barat di Bandung;",
        `${peg.unitKerja || "Kepala SMA/SMK Bersangkutan"};`,
        "Pegawai Yang bersangkutan untuk diketahui dan digunakan seperlunya."
      ]);
    } else {
      setDirectTembusanList([
        "Kepala Dinas Pendidikan Provinsi Jawa Barat di Bandung;",
        "Kepala Badan Pengelolaan Keuangan dan Aset Daerah Provinsi Jawa Barat di Bandung;",
        "Kepala Subbag Tata Usaha Dinas Pendidikan Provinsi Jawa Barat di Bandung;",
        "Pegawai Yang bersangkutan. Untuk diketahui dan digunakan seperlunya."
      ]);
    }
  };

  const handleDownloadPDF = () => {
    if (!directPrintPegawai) return;
    
    // Save manual edits to the pegawai's persistent profile first, silently!
    const updatedPegawai = {
      ...directPrintPegawai,
      noSuratBaru: directNomorSurat,
      tglSuratBaru: directTanggalSurat
    };
    onUpdatePegawai(directPrintPegawai.id, updatedPegawai, true);
    onLogActivity("Unduh PDF SKGB", `Mengunduh berkas PDF SKGB untuk ${directPrintPegawai.nama} (NIP: ${directPrintPegawai.nip}).`);

    Swal.fire({
      title: "Membuat File PDF...",
      text: "Mohon tunggu sejenak, berkas PDF sedang di-render dengan kualitas tinggi.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    import("html2pdf.js").then((html2pdfModule) => {
      const html2pdf = html2pdfModule.default;
      const element = document.getElementById("skgb-direct-print-preview-container");
      
      if (!element) {
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
          filename: `SKGB_${directPrintPegawai.nama.replace(/\s+/g, "_")}_${directPrintPegawai.nip}.pdf`,
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
              Swal.fire({
                title: "PDF Berhasil Diunduh!",
                text: "Berkas PDF SKGB berhasil diunduh dengan penyesuaian resolusi.",
                icon: "success",
                confirmButtonColor: "#10b981"
              });
            })
            .catch((retryErr: any) => {
              console.error("All PDF render attempts failed:", retryErr);
              Swal.fire({
                title: "Gagal Membuat PDF",
                text: `Terjadi kesalahan teknis saat membuat berkas PDF: ${retryErr?.message || retryErr || "Unknown error"}. Silakan gunakan opsi 'Cetak Manual' di browser dan simpan sebagai PDF.`,
                icon: "error"
              });
            });
        });
    }).catch(err => {
      console.error(err);
      Swal.fire({
        title: "Gagal Mengunduh",
        text: "Gagal memuat modul PDF generator.",
        icon: "error"
      });
    });
  };

  // Helper to open form for editing or adding
  const openForm = (pegawai: Pegawai | null = null) => {
    if (pegawai) {
      setEditingPegawai(pegawai);
      setNama(pegawai.nama);
      setNip(pegawai.nip);
      setTempatLahir(pegawai.tempatLahir);
      setTanggalLahir(pegawai.tanggalLahir);
      setPangkatGolongan(pegawai.pangkatGolongan);
      setJabatan(pegawai.jabatan);
      setUnitKerja(pegawai.unitKerja);
      setGajiPokokLama(pegawai.gajiPokokLama);
      setNoHp(pegawai.noHp || "");
      setEmail(pegawai.email || "");

      setSkOlehPejabat(pegawai.skOlehPejabat);
      setSkNomor(pegawai.skNomor);
      setSkTanggal(pegawai.skTanggal);
      setSkTglMulaiBerlaku(pegawai.skTglMulaiBerlaku);
      setSkMasaKerjaTahun(pegawai.skMasaKerjaTahun);
      setSkMasaKerjaBulan(pegawai.skMasaKerjaBulan);

      setHasPMK(pegawai.hasPMK);
      setPmkTahun(pegawai.pmkTahun || 0);
      setPmkBulan(pegawai.pmkBulan || 0);
      setPmkNomor(pegawai.pmkNomor || "");
      setPmkTanggal(pegawai.pmkTanggal || "");

      setGajiPokokBaru(pegawai.gajiPokokBaru);
      setPangkatGolonganBaru(pegawai.pangkatGolonganBaru || pegawai.pangkatGolongan);
      setJabatanBaru(pegawai.jabatanBaru || pegawai.jabatan);
      setNoSuratBaru(pegawai.noSuratBaru || "");
      setTglSuratBaru(pegawai.tglSuratBaru || "");
      setMkTahunBaru(pegawai.mkTahunBaru);
      setMkBulanBaru(pegawai.mkBulanBaru);
      setTmtBaru(pegawai.tmtBaru);
      setTmtAkanDatang(pegawai.tmtAkanDatang);

      const isPegPPPK = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(pegawai.pangkatGolongan);
      setFormType(isPegPPPK ? KepegawaianType.PPPK : KepegawaianType.PNS);
    } else {
      setEditingPegawai(null);
      setNama("");
      setNip("");
      setTempatLahir("");
      setTanggalLahir("");
      setPangkatGolongan("PENATA Tk. I, III/d");
      setJabatan("GURU AHLI MUDA");
      setUnitKerja("SMA NEGERI 1 CIHAURBEUTI");
      setGajiPokokLama(4042500);
      setNoHp("");
      setEmail("");

      setSkOlehPejabat("KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII");
      setSkNomor("");
      setSkTanggal("");
      setSkTglMulaiBerlaku("");
      setSkMasaKerjaTahun(16);
      setSkMasaKerjaBulan(10);

      setHasPMK(false);
      setPmkTahun(0);
      setPmkBulan(0);
      setPmkNomor("");
      setPmkTanggal("");

      setGajiPokokBaru(4169900);
      setPangkatGolonganBaru("PENATA Tk. I, III/d");
      setJabatanBaru("");
      setNoSuratBaru("");
      setTglSuratBaru("");
      setMkTahunBaru(18);
      setMkBulanBaru(0);
      setTmtBaru("");
      setTmtAkanDatang("");
      
      setFormType(KepegawaianType.PNS);
    }
    setFormActiveTab("pribadi");
    setIsFormOpen(true);
  };

  // Download Template XLSX/CSV
  const handleDownloadTemplate = (format: "xlsx" | "csv") => {
    const templateHeaders = [
      "No",
      "Nama Pegawai (Lengkap)",
      "NIP",
      "Tempat Lahir",
      "Tanggal Lahir (YYYY-MM-DD)",
      "Pangkat Golongan", // e.g. "IX" or "PENATA, III/c"
      "Jabatan",
      "Jabatan Baru",
      "Unit Kerja (Sekolah)",
      "Gaji Pokok Lama",
      "Gaji Pokok Baru",
      "Masa Kerja Golongan Tahun (Baru)",
      "Masa Kerja Golongan Bulan (Baru)",
      "No HP (Optional)",
      "Email (Optional)",
      "SK Lama Oleh Pejabat",
      "SK Lama Nomor",
      "SK Lama Tanggal (YYYY-MM-DD)",
      "SK Lama TMT Berlaku (YYYY-MM-DD)",
      "SK Lama Masa Kerja Tahun",
      "SK Lama Masa Kerja Bulan",
      "TMT KGB Baru (YYYY-MM-DD)",
      "TMT KGB YAD (YYYY-MM-DD)",
      "Status KGB (Selesai / Perlu Diproses / Mendekati Jatuh Tempo)",
      "Nomor Surat KGB Baru (Optional)",
      "Tanggal Surat KGB Baru (YYYY-MM-DD) (Optional)"
    ];

    const sampleRow = [
      1,
      "BUDI SANTOSO, S.Pd.",
      "198510102015031002",
      "CIAMIS",
      "1985-10-10",
      "PENATA, III/c",
      "GURU AHLI MUDA",
      "GURU AHLI MADYA",
      "SMAN 1 CIHAURBEUTI",
      3502000,
      3610000,
      10,
      4,
      "081234567890",
      "budi.santoso@gmail.com",
      "KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII",
      "800/KPG.14/KCD.XIII",
      "2024-03-15",
      "2024-04-01",
      8,
      2,
      "2026-04-01",
      "2028-04-01",
      "Selesai",
      "800/KCD-XIII/001/2026",
      "2026-03-25"
    ];

    if (format === "xlsx") {
      const worksheet = XLSX.utils.aoa_to_sheet([templateHeaders, sampleRow]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template_Pegawai");
      XLSX.writeFile(workbook, "Template_Import_Pegawai_SKGB.xlsx");
    } else {
      const csvRows = [
        templateHeaders.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
        sampleRow.map(v => typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v).join(",")
      ];
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Template_Import_Pegawai_SKGB.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Parser handle from file upload change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    setImportPreviewData([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const arrayBuffer = evt.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        if (rawRows.length < 2) {
          throw new Error("File tidak memiliki baris data (kosong atau hanya header)");
        }

        const headers = (rawRows[0] || []).map((h: any) => String(h || "").trim().toLowerCase());

        const findHeaderIdx = (keywords: string[], defaultIdx: number): number => {
          const found = headers.findIndex((h: string) => 
            keywords.some(kw => h.includes(kw.toLowerCase()))
          );
          return found !== -1 ? found : defaultIdx;
        };

        const idxNama = findHeaderIdx(["nama pegawai", "nama lengkap", "nama"], 1);
        const idxNip = findHeaderIdx(["nip"], 2);
        const idxTempatLahir = findHeaderIdx(["tempat lahir"], 3);
        const idxTanggalLahir = findHeaderIdx(["tanggal lahir"], 4);
        const idxPangkatGolonganBaru = findHeaderIdx(["pangkat golongan baru", "pangkat/golongan baru", "golongan baru", "pangkat baru"], 5);
        const idxPangkatGolongan = findHeaderIdx(["pangkat golongan lama", "pangkat/golongan lama", "golongan lama", "pangkat lama", "pangkat golongan", "pangkat/golongan", "pangkat", "golongan"], 5);
        const idxJabatan = findHeaderIdx(["jabatan lama", "jabatan"], 6);
        const idxJabatanBaru = findHeaderIdx(["jabatan baru"], 7);
        const idxUnitKerja = findHeaderIdx(["unit kerja", "sekolah"], 8);
        const idxGajiPokokLama = findHeaderIdx(["gaji pokok lama", "gaji lama"], 9);
        const idxGajiPokokBaru = findHeaderIdx(["gaji pokok baru", "gaji baru"], 10);
        const idxMkTahunBaru = findHeaderIdx(["masa kerja golongan tahun (baru)", "masa kerja tahun baru", "mk tahun baru", "mk golongan tahun"], 11);
        const idxMkBulanBaru = findHeaderIdx(["masa kerja golongan bulan (baru)", "masa kerja bulan baru", "mk bulan baru", "mk golongan bulan"], 12);
        const idxNoHp = findHeaderIdx(["no hp", "nomor hp", "whatsapp", "no. hp", "telepon"], 13);
        const idxEmail = findHeaderIdx(["email"], 14);
        const idxSkOlehPejabat = findHeaderIdx(["sk lama oleh pejabat", "oleh pejabat", "pejabat penerbit"], 15);
        const idxSkNomor = findHeaderIdx(["sk lama nomor", "nomor sk lama", "no sk lama", "sk nomor"], 16);
        const idxSkTanggal = findHeaderIdx(["sk lama tanggal", "tanggal sk lama", "sk tanggal"], 17);
        const idxSkTglMulaiBerlaku = findHeaderIdx(["sk lama tmt berlaku", "tmt berlaku sk lama", "sk tmt"], 18);
        const idxSkMasaKerjaTahun = findHeaderIdx(["sk lama masa kerja tahun", "masa kerja tahun sk lama"], 19);
        const idxSkMasaKerjaBulan = findHeaderIdx(["sk lama masa kerja bulan", "masa kerja bulan sk lama"], 20);
        const idxTmtBaru = findHeaderIdx(["tmt kgb baru", "tmt baru"], 21);
        const idxTmtAkanDatang = findHeaderIdx(["tmt kgb yad", "tmt yad", "tmt berikutnya"], 22);
        const idxStatusKGB = findHeaderIdx(["status kgb", "status"], 23);
        const idxNoSuratBaru = findHeaderIdx(["nomor surat kgb baru", "nomor surat baru", "no surat baru", "nomor surat (agenda)", "nomor surat agenda"], 24);
        const idxTglSuratBaru = findHeaderIdx(["tanggal surat kgb baru", "tanggal surat baru", "tgl surat baru", "tanggal surat kgb", "tgl surat kgb", "tanggal surat"], 25);

        const dataRows = rawRows.slice(1); // skip headers
        const parsedPegList: Pegawai[] = [];

        dataRows.forEach((row, idx) => {
          if (!row || row.length === 0) return;

          const cell = (colIdx: number, fallback: any = "") => {
            const val = row[colIdx];
            return val !== undefined && val !== null ? val : fallback;
          };

          const namaVal = String(cell(idxNama)).trim();
          const nipVal = String(cell(idxNip)).trim().replace(/[^0-9]/g, "");
          if (!namaVal || !nipVal) return;

          const rawPangkatGolongan = String(cell(idxPangkatGolongan)).trim();
          const rawPangkatGolonganBaru = cell(idxPangkatGolonganBaru) ? String(cell(idxPangkatGolonganBaru)).trim() : rawPangkatGolongan;
          const rawJabatan = String(cell(idxJabatan)).trim().toUpperCase();
          let rawJabatanBaru = String(cell(idxJabatanBaru)).trim().toUpperCase();

          // Auto-calculate Jabatan Baru if empty, or same as Jabatan but needs to be promoted based on Guru rules
          if (!rawJabatanBaru || rawJabatanBaru === "-" || rawJabatanBaru === rawJabatan) {
            rawJabatanBaru = rawJabatan;
            const isGuru = rawJabatan.toUpperCase().includes("GURU");
            const oldGol = rawPangkatGolongan.toUpperCase();
            const newGol = rawPangkatGolonganBaru.toUpperCase();

            if (isGuru) {
              const isOld3B = oldGol.includes("III/B") || oldGol.includes("3B");
              const isNew3C = newGol.includes("III/C") || newGol.includes("3C");
              const isOld3D = oldGol.includes("III/D") || oldGol.includes("3D");
              const isNew4A = newGol.includes("IV/A") || newGol.includes("4A");

              if (isOld3B && isNew3C) {
                rawJabatanBaru = "GURU AHLI MUDA";
              } else if (isOld3D && isNew4A) {
                rawJabatanBaru = "GURU AHLI MADYA";
              }
            }
          }

          const pegItem: Pegawai = {
            id: `peg-import-${Date.now()}-${idx}`,
            nama: namaVal.toUpperCase(),
            nip: nipVal,
            tempatLahir: String(cell(idxTempatLahir)).trim().toUpperCase(),
            tanggalLahir: cell(idxTanggalLahir) ? String(cell(idxTanggalLahir)).trim() : "1980-01-01",
            pangkatGolongan: rawPangkatGolongan,
            pangkatGolonganBaru: rawPangkatGolonganBaru,
            jabatan: rawJabatan,
            jabatanBaru: rawJabatanBaru,
            unitKerja: String(cell(idxUnitKerja)).trim().toUpperCase(),
            gajiPokokLama: Number(cell(idxGajiPokokLama, 0)),
            gajiPokokBaru: Number(cell(idxGajiPokokBaru, 0)),
            mkTahunBaru: Number(cell(idxMkTahunBaru, 0)),
            mkBulanBaru: Number(cell(idxMkBulanBaru, 0)),
            noHp: cell(idxNoHp) ? String(cell(idxNoHp)).trim() : undefined,
            email: cell(idxEmail) ? String(cell(idxEmail)).trim() : undefined,
            skOlehPejabat: String(cell(idxSkOlehPejabat, "KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII")),
            skNomor: String(cell(idxSkNomor, "800/KCD-XIII")),
            skTanggal: cell(idxSkTanggal) ? String(cell(idxSkTanggal)).trim() : "2024-01-01",
            skTglMulaiBerlaku: cell(idxSkTglMulaiBerlaku) ? String(cell(idxSkTglMulaiBerlaku)).trim() : "2024-01-01",
            skMasaKerjaTahun: Number(cell(idxSkMasaKerjaTahun, 0)),
            skMasaKerjaBulan: Number(cell(idxSkMasaKerjaBulan, 0)),
            hasPMK: false,
            tmtBaru: cell(idxTmtBaru) ? String(cell(idxTmtBaru)).trim() : "2026-01-01",
            tmtAkanDatang: cell(idxTmtAkanDatang) ? String(cell(idxTmtAkanDatang)).trim() : "2028-01-01",
            statusKGB: (cell(idxStatusKGB) ? String(cell(idxStatusKGB)).trim() : "Selesai") as any,
            noSuratBaru: cell(idxNoSuratBaru) ? String(cell(idxNoSuratBaru)).trim() : undefined,
            tglSuratBaru: cell(idxTglSuratBaru) ? String(cell(idxTglSuratBaru)).trim() : undefined
          };

          // Skip example template row (Budi Santoso) to prevent placeholder leakage
          if (pegItem.nama === "BUDI SANTOSO, S.PD." || pegItem.nip === "198510102015031002") {
            return;
          }

          if (pegItem.nama && pegItem.nip) {
            parsedPegList.push(pegItem);
          }
        });

        if (parsedPegList.length === 0) {
          throw new Error("Format kolom tidak pas atau tidak ditemukan data pegawai valid yang memiliki Nama & NIP");
        }

        setImportPreviewData(parsedPegList);
      } catch (err: any) {
        setImportError(err.message || "Gagal mengolah file. Pastikan format kolom sesuai template.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = () => {
    if (importPreviewData.length === 0) return;
    
    if (onImportPegawaiBatch) {
      onImportPegawaiBatch(importPreviewData);
    } else {
      importPreviewData.forEach(peg => {
        onAddPegawai(peg);
      });
    }

    setImportPreviewData([]);
    setIsImportModalOpen(false);
  };

  // Autocalculate values helper
  const handleAutoCalculateKGB = () => {
    // Masa Kerja is basically SK Masa Kerja + 2 Years, plus PMK helper if activated.
    const calculatedMKTahun = Number(skMasaKerjaTahun) + 2 + (hasPMK ? Number(pmkTahun) : 0);
    const calculatedMKBulan = Number(skMasaKerjaBulan) + (hasPMK ? Number(pmkBulan) : 0);
    
    const finalNewMKTahun = calculatedMKTahun + Math.floor(calculatedMKBulan / 12);
    const finalNewMKBulan = calculatedMKBulan % 12;

    setMkTahunBaru(finalNewMKTahun);
    setMkBulanBaru(finalNewMKBulan);

    // Fetch from official database lookup
    const lookedUpGajiLama = getSalaryByGolonganAndMasaKerja(pangkatGolongan, Number(skMasaKerjaTahun));
    const lookedUpGajiBaru = getSalaryByGolonganAndMasaKerja(pangkatGolonganBaru || pangkatGolongan, finalNewMKTahun);

    if (lookedUpGajiLama > 0) {
      setGajiPokokLama(lookedUpGajiLama);
    }

    if (lookedUpGajiBaru > 0) {
      setGajiPokokBaru(lookedUpGajiBaru);
    } else if (lookedUpGajiLama > 0) {
      setGajiPokokBaru(Math.round(lookedUpGajiLama * 1.0314 / 100) * 100);
    }

    if (!jabatanBaru && jabatan) {
      setJabatanBaru(jabatan);
    }

    if (skTglMulaiBerlaku) {
      // TMT Baru is TMT Lama + 2 Years
      const tmtLamaDate = new Date(skTglMulaiBerlaku);
      if (!isNaN(tmtLamaDate.getTime())) {
        const tmtBaruDate = new Date(skTglMulaiBerlaku);
        tmtBaruDate.setFullYear(tmtLamaDate.getFullYear() + 2);
        const yNew = tmtBaruDate.getFullYear();
        const mNew = String(tmtBaruDate.getMonth() + 1).padStart(2, '0');
        const dNew = String(tmtBaruDate.getDate()).padStart(2, '0');
        const tmtBaruString = `${yNew}-${mNew}-${dNew}`;
        setTmtBaru(tmtBaruString);

        // Kenaikan yang akan datang is TMT baru + 2 Years
        if (finalNewMKTahun >= 32) {
          setTmtAkanDatang("MAKSIMAL");
        } else {
          const nextKgbDate = new Date(tmtBaruString);
          nextKgbDate.setFullYear(nextKgbDate.getFullYear() + 2);
          const yNext = nextKgbDate.getFullYear();
          const mNext = String(nextKgbDate.getMonth() + 1).padStart(2, '0');
          const dNext = String(nextKgbDate.getDate()).padStart(2, '0');
          setTmtAkanDatang(`${yNext}-${mNext}-${dNext}`);
        }
      }
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !nip || !pangkatGolongan || !jabatan || !unitKerja || !gajiPokokLama) {
      alert("Harap lengkapi semua data wajib pada formulir.");
      return;
    }

    // Determine KGB Status automatically based on TMT Baru compared to today (June 16, 2026)
    const today = new Date("2026-06-16");
    const tmtDate = new Date(tmtBaru || "2026-06-16");
    const diffTime = tmtDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Check if there is already an uploaded file (preserve it on edit)
    const hasUploadedFile = editingPegawai?.kgbFileUrl ? true : false;
    
    let computedStatus: "Selesai" | "Perlu Diproses" | "Mendekati Jatuh Tempo" | "Belum Selesai" = "Belum Selesai";
    if (hasUploadedFile) {
      computedStatus = "Selesai";
    } else {
      if (diffDays <= 0) {
        computedStatus = "Belum Selesai";
      } else if (diffDays <= 90) { // under 3 months
        computedStatus = "Mendekati Jatuh Tempo";
      } else {
        computedStatus = "Perlu Diproses";
      }
    }

    const payload: Pegawai = {
      id: editingPegawai ? editingPegawai.id : "peg-" + Date.now(),
      nama,
      nip,
      tempatLahir,
      tanggalLahir,
      pangkatGolongan,
      pangkatGolonganBaru: pangkatGolonganBaru || pangkatGolongan,
      jabatanBaru: jabatanBaru || jabatan,
      jabatan,
      unitKerja,
      gajiPokokLama: Number(gajiPokokLama),
      noHp: noHp || undefined,
      email: email || undefined,
      skOlehPejabat,
      skNomor,
      skTanggal,
      skTglMulaiBerlaku,
      skMasaKerjaTahun: Number(skMasaKerjaTahun),
      skMasaKerjaBulan: Number(skMasaKerjaBulan),
      hasPMK,
      pmkTahun: hasPMK ? Number(pmkTahun) : undefined,
      pmkBulan: hasPMK ? Number(pmkBulan) : undefined,
      pmkNomor: hasPMK ? pmkNomor : undefined,
      pmkTanggal: hasPMK ? pmkTanggal : undefined,
      gajiPokokBaru: Number(gajiPokokBaru) || Number(gajiPokokLama),
      mkTahunBaru: Number(mkTahunBaru),
      mkBulanBaru: Number(mkBulanBaru),
      tmtBaru,
      tmtAkanDatang,
      noSuratBaru: noSuratBaru || undefined,
      tglSuratBaru: tglSuratBaru || undefined,
      statusKGB: computedStatus,
      kgbFileUrl: editingPegawai?.kgbFileUrl || undefined,
      kgbFileName: editingPegawai?.kgbFileName || undefined,
      kgbUploadedAt: editingPegawai?.kgbUploadedAt || undefined,
    };

    if (editingPegawai) {
      onUpdatePegawai(editingPegawai.id, payload);
    } else {
      onAddPegawai(payload);
    }
    setIsFormOpen(false);
  };

  // Filters mapping
  const filteredList = pegawaiList.filter((peg) => {
    const matchesSearch = 
      peg.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peg.nip.includes(searchTerm) ||
      peg.unitKerja.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peg.jabatan.toLowerCase().includes(searchTerm.toLowerCase());
      
    const isPPPK = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(peg.pangkatGolongan);
    
    if (filterType === "PNS") return matchesSearch && !isPPPK;
    if (filterType === "PPPK") return matchesSearch && isPPPK;
    if (filterType === "PerluProses") return matchesSearch && peg.statusKGB !== "Selesai";
    return matchesSearch;
  });

  const triggerBulkPrint = () => {
    const selectedNames = selectedPegawaiIds
      .map(id => pegawaiList.find(p => p.id === id)?.nama)
      .filter(Boolean)
      .join(", ");
    onLogActivity(
      "Cetak Massal SKGB", 
      `Mencetak Surat Keputusan Kenaikan Gaji Berkala secara massal untuk ${selectedPegawaiIds.length} pegawai: ${selectedNames}.`
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

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num) + ",-";
  };

  return (
    <>
      <div className="space-y-6 print:hidden">
      {/* Search and Quick Filters Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Database Kepegawaian</h2>
            <p className="text-xs text-slate-500">Kelola informasi pegawai, riwayat gaji, dan rekam masa kerja pegawai.</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs font-semibold select-none">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Data Lengkap (Siap Cetak)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                <span>Perlu Input Tambahan</span>
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm inline-flex items-center space-x-2 cursor-pointer animate-pulse-subtle"
            >
              <FileSpreadsheet size={16} />
              <span>Import Excel / CSV</span>
            </button>

            <button
              onClick={() => openForm(null)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm inline-flex items-center space-x-2 cursor-pointer"
            >
              <UserPlus size={16} />
              <span>Tambah Pegawai Baru</span>
            </button>

            {onClearAllPegawai && (
              <button
                onClick={onClearAllPegawai}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm inline-flex items-center space-x-2 cursor-pointer"
              >
                <Trash2 size={16} />
                <span>Hapus Isi Tabel</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama, NIP, unit kerja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto overflow-x-auto">
            <button
              onClick={() => setFilterType("All")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                filterType === "All" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua Pegawai
            </button>
            <button
              onClick={() => setFilterType("PNS")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                filterType === "PNS" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Golongan PNS
            </button>
            <button
              onClick={() => setFilterType("PPPK")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                filterType === "PPPK" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Golongan PPPK (IX-XV)
            </button>
            <button
              onClick={() => setFilterType("PerluProses")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                filterType === "PerluProses" ? "bg-white text-rose-700 shadow-sm" : "text-slate-600 hover:text-rose-600"
              }`}
            >
              Antrean KGB
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Controls */}
      {selectedPegawaiIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-150 p-4.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
              <Printer size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-indigo-950">Mode Cetak Massal Aktif</h3>
              <p className="text-xs text-indigo-700/80 mt-0.5">
                Mencetak dokumen SKGB untuk <strong className="text-indigo-950 font-bold">{selectedPegawaiIds.length} pegawai</strong> sekaligus. Setiap surat dicetak pada lembar kertas F4 baru.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setSelectedPegawaiIds([])}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 bg-white rounded-xl transition-all cursor-pointer shadow-sm select-none"
            >
              Batalkan Pilihan
            </button>
            <button
              onClick={() => {
                const incompleteCount = selectedPegawaiIds.filter(id => {
                  const p = pegawaiList.find(x => x.id === id);
                  return p ? !isDataLengkap(p).valid : false;
                }).length;

                if (incompleteCount > 0) {
                  Swal.fire({
                    title: "Perhatian: Profil Belum Lengkap",
                    text: `Ada ${incompleteCount} pegawai dengan data yang kurang lengkap di antara data terpilih. Anda tetap dapat melanjutkan cetak, namun beberapa isian berkas mungkin kosong.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Tetap Lanjutkan Cetak",
                    cancelButtonText: "Batal, Lengkapi Dulu",
                    confirmButtonColor: "#4f46e5",
                    cancelButtonColor: "#64748b"
                  }).then((result) => {
                    if (result.isConfirmed) {
                      triggerBulkPrint();
                    }
                  });
                } else {
                  triggerBulkPrint();
                }
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-200 select-none"
            >
              <Printer size={14} className="stroke-[2.5]" />
              <span>Cetak SKGB Terpilih ({selectedPegawaiIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Database Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                <th className="p-4 pl-6 w-12 text-center select-none">
                  <input
                    type="checkbox"
                    checked={filteredList.length > 0 && filteredList.every(p => selectedPegawaiIds.includes(p.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPegawaiIds(filteredList.map(p => p.id));
                      } else {
                        setSelectedPegawaiIds([]);
                      }
                    }}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="p-4">Profil Pegawai</th>
                <th className="p-4">Golongan / NIP</th>
                <th className="p-4">Unit Kerja & Jabatan</th>
                <th className="p-4">Masa Kerja & Gaji Lama</th>
                <th className="p-4 text-emerald-800">KGB Baru (Nominal, MK, TMT)</th>
                <th className="p-4">Status & Alur KGB</th>
                <th className="p-4 text-center">Aksi Kendali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2 py-6">
                      <div className="p-3 bg-slate-100 text-slate-400 rounded-full">
                        <UserPlus size={24} />
                      </div>
                      <p className="font-semibold text-slate-700">Tidak ada pegawai ditemukan</p>
                      <p className="text-xs">Coba ubah kata kunci pencarian Anda atau tambahkan pegawai baru.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((peg) => {
                  const isPPPK = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(peg.pangkatGolongan);
                  const validation = isDataLengkap(peg);
                  return (
                    <tr key={peg.id} className="hover:bg-slate-50 transition-colors">
                      {/* Checkbox selector column */}
                      <td className="p-4 pl-6 text-center select-none">
                        <input
                          type="checkbox"
                          checked={selectedPegawaiIds.includes(peg.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPegawaiIds((prev) => [...prev, peg.id]);
                            } else {
                              setSelectedPegawaiIds((prev) => prev.filter((id) => id !== peg.id));
                            }
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Profil Name */}
                      <td className="p-4">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <div className="font-bold text-slate-900 leading-tight">{peg.nama}</div>
                          {validation.valid ? (
                            <span 
                              className="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0"
                              title="Profil Lengkap - Siap Cetak Berkas SKGB"
                            >
                              <Check size={11} className="stroke-[3]" />
                            </span>
                          ) : (
                            <span 
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[9.5px] font-extrabold cursor-help shrink-0"
                              title={`Profil belum lengkap. Data yang kurang: ${validation.missingFields.join(', ')}`}
                            >
                              <AlertTriangle size={10} className="stroke-[2.5] text-amber-600" />
                              <span>{validation.missingFields.length} Kurang</span>
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-xs mt-1 flex items-center gap-3">
                          {peg.noHp && (
                            <span className="inline-flex items-center gap-1">
                              <Phone size={10} />
                              {peg.noHp}
                            </span>
                          )}
                          {peg.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail size={10} />
                              <span className="truncate max-w-[120px]">{peg.email}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* NIP / Golongan */}
                      <td className="p-4">
                        <div className="font-mono text-slate-800 text-xs font-semibold">{peg.nip}</div>
                        <div className="mt-1">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                            isPPPK 
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {isPPPK ? `PPPK (GOL ${peg.pangkatGolongan})` : `PNS (${peg.pangkatGolongan})`}
                          </span>
                        </div>
                      </td>

                      {/* Unit Kerja / Jabatan */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-850 leading-tight block">{peg.jabatan}</div>
                        <div className="text-slate-400 text-xs truncate max-w-[200px] mt-0.5" title={peg.unitKerja}>
                          {peg.unitKerja}
                        </div>
                      </td>

                      {/* SK Gaji & PMK info */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{formatRupiah(peg.gajiPokokLama)}</div>
                        <div className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5">
                          <span>{peg.skMasaKerjaTahun}th {peg.skMasaKerjaBulan}bl</span>
                          {peg.hasPMK && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] px-1 rounded font-bold">
                              +PMK {peg.pmkTahun}th
                            </span>
                          )}
                        </div>
                      </td>

                      {/* KGB Baru (Nominal, MK, TMT) */}
                      <td className="p-4 bg-emerald-50/30">
                        <div className="font-bold text-emerald-800">{formatRupiah(peg.gajiPokokBaru)}</div>
                        <div className="text-slate-600 text-xs font-semibold mt-0.5">
                          MK: {peg.mkTahunBaru}th {peg.mkBulanBaru}bl
                        </div>
                        <div className="text-[10px] text-emerald-950 font-bold mt-0.5 font-mono">
                          TMT: {peg.tmtBaru}
                        </div>
                      </td>

                      {/* Status / TMT & File Archive */}
                      <td className="p-4 min-w-[180px]">
                        <div className="text-[11px] text-slate-500 mb-1">
                          TMT: <span className="font-bold text-slate-700">{peg.tmtBaru}</span>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <div>
                            <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full inline-block ${
                              peg.statusKGB === "Selesai"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : peg.statusKGB === "Belum Selesai"
                                ? "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse-subtle"
                                : peg.statusKGB === "Perlu Diproses"
                                ? "bg-sky-50 text-sky-700 border border-sky-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {peg.statusKGB === "Selesai" ? "✓ Selesai" : peg.statusKGB}
                            </span>
                          </div>

                          {/* Digital Archiving controls */}
                          {peg.kgbFileUrl ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handlePreviewKgbFile(peg)}
                                className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer flex-1 justify-center"
                                title="Pratinjau & Unduh Dokumen Sah"
                              >
                                <Eye size={10} />
                                <span className="truncate max-w-[100px]">{peg.kgbFileName || "Lihat KGB"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteKgbFile(peg)}
                                className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md border border-rose-200 cursor-pointer transition-colors"
                                title="Hapus Berkas Arsip"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ) : (
                            <div>
                              <input
                                type="file"
                                accept="application/pdf,image/*"
                                id={`file-upload-${peg.id}`}
                                className="hidden"
                                onChange={(e) => handleUploadKgbFile(peg.id, e)}
                              />
                              <label
                                htmlFor={`file-upload-${peg.id}`}
                                className="inline-flex items-center gap-1 text-[10px] text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-2 py-1 rounded-md cursor-pointer font-bold transition-all w-full justify-center select-none"
                              >
                                <Upload size={10} />
                                <span>Unggah KGB Sah</span>
                              </label>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleOpenDirectPrint(peg)}
                            className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all flex items-center justify-center text-xs font-semibold gap-1 cursor-pointer"
                            title="Pratinjau & Cetak Langsung (F4/Folio)"
                          >
                            <Printer size={13} />
                            <span>Cetak</span>
                          </button>
                          <button
                            onClick={() => onSelectPegawaiForSKGB(peg)}
                            className="p-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-all flex items-center justify-center text-xs font-semibold gap-1 cursor-pointer"
                            title="Buka Menu Cetak Lanjutan / Kustomisasi"
                          >
                            <FileText size={12} />
                          </button>
                          <button
                            onClick={() => openForm(peg)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Pegawai"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus data pegawai ${peg.nama}?`)) {
                                onDeletePegawai(peg.id);
                              }
                            }}
                            className="p-1.5 bg-rose-55 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Pegawai"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Form Drawer (Modal) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-indigo-900/50">
              <div>
                <h3 className="font-bold text-base">
                  {editingPegawai ? "Ubah Profil Pegawai" : "Tambah Pegawai Baru ke Database"}
                </h3>
                <p className="text-xs text-indigo-200 mt-1">
                  Harap lengkapi detail profil di bawah untuk memproses berkas otomatis.
                </p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Custom Tab Bar for fields structure */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-sm">
              <button
                type="button"
                onClick={() => setFormActiveTab("pribadi")}
                className={`flex-1 py-3 text-center font-semibold border-b-2 transition-all cursor-pointer ${
                  formActiveTab === "pribadi" 
                    ? "border-indigo-600 text-indigo-700 bg-white" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                1. Profil Pribadi
              </button>
              <button
                type="button"
                onClick={() => setFormActiveTab("sk")}
                className={`flex-1 py-3 text-center font-semibold border-b-2 transition-all cursor-pointer ${
                  formActiveTab === "sk" 
                    ? "border-indigo-600 text-indigo-700 bg-white" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                2. SK Lama (Terakhir)
              </button>
              <button
                type="button"
                onClick={() => setFormActiveTab("pmk")}
                className={`flex-1 py-3 text-center font-semibold border-b-2 transition-all cursor-pointer ${
                  formActiveTab === "pmk" 
                    ? "border-indigo-600 text-indigo-700 bg-white" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                3. Tambah MK (PMK)
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAutoCalculateKGB();
                  setFormActiveTab("baru");
                }}
                className={`flex-1 py-3 text-center font-semibold border-b-2 transition-all cursor-pointer ${
                  formActiveTab === "baru" 
                    ? "border-indigo-600 text-indigo-700 bg-white" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                4. KGB Baru (Kalkulator)
              </button>
            </div>

            {/* Form Fields Scroller */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSaveForm} className="space-y-6">
                
                {/* TAB 1: DATA PRIBADI */}
                {formActiveTab === "pribadi" && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 text-emerald-900 p-4 rounded-xl text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <Info size={14} />
                        Petunjuk Pengisian Nama & NIP
                      </p>
                      <p className="font-medium text-[11px]">
                        Isi nama lengkap berserta gelar akademisnya. NIP pegawai harus diisi tanpa spasi. Jenis kepegawaian menentukan template dan format logo tanda tangan.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Nama Lengkap & Gelar *</label>
                        <input
                          type="text"
                          required
                          value={nama}
                          onChange={(e) => setNama(e.target.value)}
                          placeholder="e.g. WIKA NAJMUDIN, S.Pd."
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Pilih Jenis Kepegawaian *</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleTypeChange(KepegawaianType.PNS)}
                            className={`py-2 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              formType === KepegawaianType.PNS
                                ? "bg-blue-50 border-blue-400 text-blue-900 shadow-sm"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            PNS (Negeri Sipil)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTypeChange(KepegawaianType.PPPK)}
                            className={`py-2 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              formType === KepegawaianType.PPPK
                                ? "bg-purple-50 border-purple-400 text-purple-900 shadow-sm"
                                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            PPPK (Perjanjian Kerja)
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Golongan Ruang *</label>
                        {formType === KepegawaianType.PNS ? (
                          <SearchableSelect
                            options={listPangkatPNS}
                            value={pangkatGolongan}
                            onChange={(val) => setPangkatGolongan(val)}
                            placeholder="Cari pangkat/golongan PNS..."
                          />
                        ) : (
                          <SearchableSelect
                            options={listGolonganPPPK}
                            value={pangkatGolongan}
                            onChange={(val) => setPangkatGolongan(val)}
                            placeholder="Cari golongan PPPK..."
                            labelPrefix="Golongan"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">NIP Pegawai *</label>
                        <input
                          type="text"
                          required
                          value={nip}
                          onChange={(e) => setNip(e.target.value.replace(/\s+/g, ""))}
                          placeholder="e.g. 198109052024211004"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Jabatan *</label>
                        <input
                          type="text"
                          required
                          value={jabatan}
                          onChange={(e) => setJabatan(e.target.value)}
                          placeholder="e.g. GURU AHLI PERTAMA - PPKN"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Unit Kerja *</label>
                        <input
                          type="text"
                          required
                          value={unitKerja}
                          onChange={(e) => setUnitKerja(e.target.value)}
                          placeholder="e.g. SMKN CIMERAK KABUPATEN PANGANDARAN"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Tempat Lahir</label>
                        <input
                          type="text"
                          value={tempatLahir}
                          onChange={(e) => setTempatLahir(e.target.value.toUpperCase())}
                          placeholder="e.g. CIAMIS"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Tanggal Lahir</label>
                        <input
                          type="date"
                          value={tanggalLahir}
                          onChange={(e) => setTanggalLahir(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">No. Handphone (WA info)</label>
                        <input
                          type="tel"
                          value={noHp}
                          onChange={(e) => setNoHp(e.target.value)}
                          placeholder="e.g. 08123456789"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Alamat Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. pegawai@jabarprov.go.id"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SK TERAKHIR (LAMA) */}
                {formActiveTab === "sk" && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 text-slate-700 p-4 rounded-xl text-xs space-y-1 border border-slate-200">
                      <p className="font-bold flex items-center gap-1.5 text-slate-800">
                        <Info size={14} />
                        Keterangan SK Kenaikan Gaji/Pangkat Terakhir
                      </p>
                      <p className="font-medium">
                        Masukkan rincian Surat Keputusan yang berlaku saat ini. Sistem akan menggunakannya sebagai acuan dasar (Atas Dasar No & Tanggal) dalam draf berkas SKGB baru.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Pejabat Pengesah SK Terakhir *</label>
                        <input
                          type="text"
                          required
                          value={skOlehPejabat}
                          onChange={(e) => setSkOlehPejabat(e.target.value)}
                          placeholder="e.g. KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Nomor SK Terakhir *</label>
                        <input
                          type="text"
                          required
                          value={skNomor}
                          onChange={(e) => setSkNomor(e.target.value)}
                          placeholder="e.g. NO.1658/KPG.14.KCD-XIII"
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Tanggal Terbit SK Terakhir *</label>
                        <input
                          type="date"
                          required
                          value={skTanggal}
                          onChange={(e) => setSkTanggal(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">TMT / Tanggal Gaji Berlaku Lama *</label>
                        <input
                          type="date"
                          required
                          value={skTglMulaiBerlaku}
                          onChange={(e) => setSkTglMulaiBerlaku(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Gaji Pokok Lama (Laporan SK) *</label>
                        <input
                          type="number"
                          required
                          value={gajiPokokLama}
                          onChange={(e) => setGajiPokokLama(Number(e.target.value))}
                          placeholder="Rp."
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Masa Kerja Golongan (SK Lama): Tahun</label>
                        <input
                          type="number"
                          value={skMasaKerjaTahun}
                          onChange={(e) => setSkMasaKerjaTahun(Number(e.target.value))}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Masa Kerja Golongan (SK Lama): Bulan</label>
                        <input
                          type="number"
                          value={skMasaKerjaBulan}
                          onChange={(e) => setSkMasaKerjaBulan(Number(e.target.value))}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: PENAMBAHAN MASA KERJA (PMK) */}
                {formActiveTab === "pmk" && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 text-amber-900 p-4 rounded-xl text-xs space-y-1 border border-amber-200">
                      <p className="font-bold flex items-center gap-1.5 text-amber-800">
                        <Info size={14} />
                        Penambahan Masa Kerja (PMK) Fleksibel
                      </p>
                      <p className="font-medium leading-relaxed">
                        Jika Pegawai terkait memiliki ketetapan luar biasa berupa Penambahan Masa Kerja (PMK) dari Kepala BKN / Gubernur, aktifkan opsi ini. Total waktu masa kerja baru akan ditambahkan dari nilai akumulatif di bawah ini.
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <input
                        type="checkbox"
                        id="hasPMK"
                        checked={hasPMK}
                        onChange={(e) => setHasPMK(e.target.checked)}
                        className="w-4.5 h-4.5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="hasPMK" className="text-sm font-bold text-slate-700 cursor-pointer">
                        Aktifkan Penambahan Masa Kerja (SK PMK) Untuk Pegawai Ini
                      </label>
                    </div>

                    {hasPMK && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-teal-100 p-5 rounded-xl bg-teal-50/20 animate-in slide-in-from-top-3 duration-200">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-teal-900 uppercase">Nomor SK PMK *</label>
                          <input
                            type="text"
                            required={hasPMK}
                            value={pmkNomor}
                            onChange={(e) => setPmkNomor(e.target.value)}
                            placeholder="e.g. SK-PMK-002/XI/2025"
                            className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-teal-900 uppercase">Tanggal SK PMK *</label>
                          <input
                            type="date"
                            required={hasPMK}
                            value={pmkTanggal}
                            onChange={(e) => setPmkTanggal(e.target.value)}
                            className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-teal-900 uppercase">PMK Tambahan Tahun *</label>
                          <input
                            type="number"
                            required={hasPMK}
                            value={pmkTahun}
                            onChange={(e) => setPmkTahun(Number(e.target.value))}
                            className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-teal-900 uppercase">PMK Tambahan Bulan *</label>
                          <input
                            type="number"
                            required={hasPMK}
                            value={pmkBulan}
                            onChange={(e) => setPmkBulan(Number(e.target.value))}
                            className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: DATA KGB BARU (AUTO CALCULATOR) */}
                {formActiveTab === "baru" && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl flex items-start gap-3">
                      <RefreshCw size={20} className="text-emerald-700 shrink-0 mt-0.5 animate-spin duration-1000" />
                      <div className="text-xs text-emerald-950 space-y-1 leading-relaxed">
                        <p className="font-bold text-emerald-800">Pemberitahuan Otomatisasi KGB</p>
                        <p>
                          Total masa kerja, Tanggal TMT KGB Baru, dan Kenaikan Berikutnya telah dihitung otomatis bertambah 2 tahun berdasarkan tanggal TMT SK Lama yang Anda input sebelumnya.
                        </p>
                        <button
                          type="button"
                          onClick={handleAutoCalculateKGB}
                          className="mt-1 py-1 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer transition-all uppercase text-[9px]"
                        >
                          Hitung / Sinkron Nilai Sekarang
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Nomor Surat Baru <span className="text-slate-400 font-normal lowercase">(Optional)</span></label>
                        <input
                          type="text"
                          value={noSuratBaru}
                          onChange={(e) => setNoSuratBaru(e.target.value)}
                          placeholder="e.g. 800/KCD-XIII/001/2026"
                          className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Tanggal Surat Baru <span className="text-slate-400 font-normal lowercase">(Optional)</span></label>
                        <input
                          type="date"
                          value={tglSuratBaru}
                          onChange={(e) => setTglSuratBaru(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-800 font-bold"
                        />
                      </div>

                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Pangkat / Golongan Baru *</label>
                        {formType === KepegawaianType.PPPK ? (
                          <SearchableSelect
                            options={listGolonganPPPK}
                            value={pangkatGolonganBaru}
                            onChange={(val) => setPangkatGolonganBaru(val)}
                            placeholder="Cari golongan baru PPPK..."
                            labelPrefix="Golongan"
                          />
                        ) : (
                          <SearchableSelect
                            options={listPangkatPNS}
                            value={pangkatGolonganBaru}
                            onChange={(val) => setPangkatGolonganBaru(val)}
                            placeholder="Cari pangkat/golongan baru PNS..."
                          />
                        )}
                      </div>

                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Jabatan Baru *</label>
                        <input
                          type="text"
                          required
                          value={jabatanBaru}
                          onChange={(e) => setJabatanBaru(e.target.value.toUpperCase())}
                          placeholder="e.g. GURU AHLI MADYA"
                          className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Gaji Pokok Baru (KGB Baru) *</label>
                        <input
                          type="number"
                          required
                          value={gajiPokokBaru}
                          onChange={(e) => setGajiPokokBaru(Number(e.target.value))}
                          placeholder="Rp."
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-bold text-emerald-800 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">TMT KGB Baru Mulai Berlaku *</label>
                        <input
                          type="date"
                          required
                          value={tmtBaru}
                          onChange={(e) => setTmtBaru(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Masa Kerja Baru: Tahun *</label>
                        <input
                          type="number"
                          required
                          value={mkTahunBaru}
                          onChange={(e) => setMkTahunBaru(Number(e.target.value))}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Masa Kerja Baru: Bulan *</label>
                        <input
                          type="number"
                          required
                          value={mkBulanBaru}
                          onChange={(e) => setMkBulanBaru(Number(e.target.value))}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">Kenaikan Gaji Berkala Berikutnya (2 Tahun Mendatang) *</label>
                        <input
                          type={tmtAkanDatang === "MAKSIMAL" ? "text" : "date"}
                          required
                          value={tmtAkanDatang}
                          onChange={(e) => setTmtAkanDatang(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </form>
            </div>

            {/* Form Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between">
              <div>
                {formActiveTab !== "pribadi" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (formActiveTab === "baru") setFormActiveTab("pmk");
                      else if (formActiveTab === "pmk") setFormActiveTab("sk");
                      else if (formActiveTab === "sk") setFormActiveTab("pribadi");
                    }}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                  >
                    Kembali
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                >
                  Batal
                </button>
                {formActiveTab !== "baru" ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (formActiveTab === "pribadi") setFormActiveTab("sk");
                      else if (formActiveTab === "sk") setFormActiveTab("pmk");
                      else if (formActiveTab === "pmk") {
                        handleAutoCalculateKGB();
                        setFormActiveTab("baru");
                      }
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition-all inline-flex items-center gap-1 cursor-pointer font-sans"
                  >
                    <span>Lanjut</span>
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveForm}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm cursor-pointer"
                  >
                    {editingPegawai ? "Simpan Perubahan" : "Simpan Pegawai"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGION: IMPORT DATA PEGAWAI EXCEL / CSV MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200/90 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Import Database Pegawai</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Unggah berkas Excel atau CSV untuk menambah data pegawai secara massal.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportPreviewData([]);
                  setImportError("");
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 border-b border-slate-100">
              
              {/* Box 1: Downoad official templates */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8">
                  <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-widest">Unduh Template Contoh Kolom</h4>
                  <p className="text-xs text-slate-650 mt-1">Gunakan template resmi kami agar urutan posisi kolom dibaca presisi oleh sistem pembaca berkas.</p>
                </div>
                <div className="md:col-span-4 flex flex-col sm:flex-row gap-2 justify-end w-full">
                  <button
                    onClick={() => handleDownloadTemplate("xlsx")}
                    className="px-3 py-2 bg-emerald-650 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[11px] inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    <Download size={13} />
                    <span>Format Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => handleDownloadTemplate("csv")}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-[11px] inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    <Download size={13} />
                    <span>Format CSV (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Box 2: Dropzone Area clickable */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 text-center bg-slate-50 hover:bg-emerald-50/10 cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".xlsx, .xls, .csv" 
                  className="hidden" 
                />
                
                <div className="w-12 h-12 bg-white group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 rounded-full border border-slate-200 shadow-sm flex items-center justify-center transition-colors">
                  <Download size={22} className="transform rotate-180" />
                </div>
                
                <h4 className="text-sm font-bold text-slate-800">Tarik berkas Anda ke sini, atau klik untuk memilih</h4>
                <p className="text-xs text-slate-400 font-medium">Menerima berkas ekstensi Excel (.xlsx / .xls) ataupun berkas teks CSV (.csv)</p>
              </div>

              {/* Error messages */}
              {importError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Grid 3: Preview Data imported list */}
              {importPreviewData.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <span>Preview Berkas Data Terbaca</span>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-extrabold">{importPreviewData.length} Baris data</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">• Pastikan Nama dan NIP telah sesuai untuk dilanjutkan</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[220px] overflow-y-auto bg-slate-50">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3 w-12 text-center text-slate-400">No</th>
                          <th className="py-2.5 px-3">Nama Pegawai</th>
                          <th className="py-2.5 px-3">NIP</th>
                          <th className="py-2.5 px-3">Golongan</th>
                          <th className="py-2.5 px-3">Unit Kerja (Sekolah)</th>
                          <th className="py-2.5 px-3 text-right">Gaji Baru</th>
                          <th className="py-2.5 px-3 w-20 text-center">TMT Baru</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/70 bg-white">
                        {importPreviewData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 text-center text-[11px] font-mono text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{item.nama}</td>
                            <td className="py-2 px-3 font-mono text-slate-500">{item.nip}</td>
                            <td className="py-2 px-3 font-bold text-slate-650">{item.pangkatGolongan}</td>
                            <td className="py-2 px-3 text-[11px] text-slate-400 font-medium truncate max-w-[200px]">{item.unitKerja}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-indigo-650">
                              {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.gajiPokokBaru).replace("Rp", "").trim()}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-500">{item.tmtBaru}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-medium">Layanan Verifikasi Format Kepegawaian Cabdisdik Wilayah XIII</span>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportPreviewData([]);
                    setImportError("");
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={importPreviewData.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-450 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <FileSpreadsheet size={14} />
                  <span>Masukkan {importPreviewData.length > 0 ? importPreviewData.length : ""} Pegawai Ke Database</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>

    {/* Direct Print & Pratinjau SKGB Modal */}
    {directPrintPegawai && (
      <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans print:p-0 print:static print:bg-white print:inset-auto">
        <div className="bg-white rounded-2xl w-full max-w-6xl shadow-2xl border border-slate-200 flex flex-col h-[90vh] overflow-hidden print:h-auto print:shadow-none print:border-none print:static">
          
          {/* Modal Header - HIDDEN ON PRINT */}
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:hidden">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Printer size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Direct Print & Pratinjau SKGB</h3>
                <p className="text-[11px] text-slate-500 font-medium">Hasilkan, edit cepat nomor/tanggal, pratinjau lembar F4, dan cetak tanpa keluar dari database.</p>
              </div>
            </div>
            <button
              onClick={() => setDirectPrintPegawai(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main split-view area */}
          <div className="flex-1 flex overflow-hidden print:block print:overflow-visible">
            
            {/* Left Side Controls - HIDDEN ON PRINT */}
            <div className="w-1/3 border-r border-slate-200 p-5 overflow-y-auto space-y-5 bg-slate-50/50 print:hidden flex flex-col justify-between">
              <div className="space-y-5">
                <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-emerald-950">Pegawai Aktif:</p>
                  <p className="font-semibold text-slate-700 text-sm">{directPrintPegawai.nama}</p>
                  <p className="font-mono text-slate-500">NIP: {directPrintPegawai.nip}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parameter Dokumen</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Surat (Agenda)</label>
                    <input
                      type="text"
                      value={directNomorSurat}
                      onChange={(e) => setDirectNomorSurat(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-sm font-mono focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Surat</label>
                    <input
                      type="date"
                      value={directTanggalSurat}
                      onChange={(e) => setDirectTanggalSurat(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-sm focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Tembusan</h4>
                    <button
                      onClick={() => setDirectTembusanList([...directTembusanList, "Tembusan baru selanjutnya;"])}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      + Tambah
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {directTembusanList.map((temb, idx) => (
                      <div key={idx} className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          value={temb}
                          onChange={(e) => {
                            const updated = [...directTembusanList];
                            updated[idx] = e.target.value;
                            setDirectTembusanList(updated);
                          }}
                          className="flex-1 px-2.5 py-1 text-xs border border-slate-200 bg-white rounded focus:border-emerald-500 text-slate-700"
                        />
                        <button
                          onClick={() => setDirectTembusanList(directTembusanList.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-rose-50 text-rose-500 rounded border border-transparent hover:border-rose-100 cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 space-y-3">
                <button
                  onClick={() => {
                    // Save manual edits to the pegawai's persistent profile first!
                    const updatedPegawai = {
                      ...directPrintPegawai,
                      noSuratBaru: directNomorSurat,
                      tglSuratBaru: directTanggalSurat
                    };
                    onUpdatePegawai(directPrintPegawai.id, updatedPegawai, true); // SILENT UPDATE!
                    onLogActivity("Simpan Parameter SKGB", `Menyimpan nomor surat (${directNomorSurat}) dan tanggal surat (${directTanggalSurat}) langsung dari pratinjau untuk ${directPrintPegawai.nama}.`);

                    Swal.fire({
                      title: "PETUNJUK UNDUH / CETAK",
                      html: `
                        <div class="text-left text-xs text-slate-700 leading-relaxed space-y-2">
                          <p class="font-bold text-slate-900 border-b pb-1.5 mb-2">Pada dialog cetak browser Anda yang akan muncul setelah ini:</p>
                          <div class="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium">
                            <p>1. Atur <strong class="text-indigo-650 font-bold">Sisi Tujuan (Destination)</strong> ke <strong>"Save as PDF"</strong> atau printer fisik.</p>
                            <p>2. Atur <strong class="text-indigo-650 font-bold">Ukuran Kertas (Paper Size)</strong> ke <strong>"Folio"</strong> / <strong>"F4"</strong>.</p>
                            <p>3. <strong>HILANGKAN CENTANG</strong> pada <strong>"Headers and footers"</strong>.</p>
                            <p>4. <strong>WAJIB CENTANG</strong> pada <span class="text-emerald-600 font-bold">"Background graphics"</span> agar Kop Dinas & TTE tercetak sempurna.</p>
                          </div>
                        </div>
                      `,
                      icon: "info",
                      confirmButtonText: "Buka Dialog Cetak",
                      confirmButtonColor: "#4f46e5",
                      showCancelButton: true,
                      cancelButtonText: "Batal",
                      cancelButtonColor: "#475569"
                    }).then((result) => {
                      if (result.isConfirmed) {
                        onLogActivity("Cetak Langsung SKGB", `Mencetak SKGB langsung untuk pegawai ${directPrintPegawai.nama} (NIP: ${directPrintPegawai.nip}).`);
                        setTimeout(() => {
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
                        }, 250);
                      }
                    });
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Cetak Manual (Dialog Browser)</span>
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-bounce-subtle"
                >
                  <Download size={14} />
                  <span>Unduh File PDF (.pdf) - REKOMENDASI</span>
                </button>

                <p className="text-[10px] text-center text-slate-400 font-medium">
                  Nomor & tanggal surat akan disinkronkan otomatis ke profil pegawai.
                </p>
              </div>
            </div>

            {/* Right Side Sheet Preview - VISIBLE ON PRINT */}
            <div className="flex-1 bg-slate-900 p-6 overflow-auto flex justify-center print:p-0 print:bg-white print:block print:static print:overflow-visible">
              <div className="origin-top scale-[0.80] md:scale-[0.85] xl:scale-[0.95] shrink-0 print:scale-100 print:transform-none">
                <div id="skgb-direct-print-preview-container">
                  <PrintTemplate
                    pegawai={directPrintPegawai}
                    settings={settings}
                    nomorSurat={directNomorSurat}
                    tanggalSurat={directTanggalSurat}
                    tembusanList={directTembusanList}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    )}

    {/* Hidden printable templates for bulk printing */}
    <div className="hidden print:block space-y-0 bg-white">
      {selectedPegawaiIds.map((id) => {
        const peg = pegawaiList.find((p) => p.id === id);
        if (!peg) return null;

        // Compute individual nomor surat
        const nomorSurat = peg.noSuratBaru || settings.nomorSuratCounter;

        // Compute date for print (format: YYYY-MM-DD)
        let tanggalSurat = peg.tglSuratBaru;
        if (!tanggalSurat) {
          const today = new Date();
          const y = today.getFullYear();
          const m = String(today.getMonth() + 1).padStart(2, '0');
          const d = String(today.getDate()).padStart(2, '0');
          tanggalSurat = `${y}-${m}-${d}`;
        }

        // Tembusan
        const isPNS = !["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(peg.pangkatGolongan);
        const tembusanList = isPNS ? [
          "Kepala Dinas Pendidikan Provinsi Jawa Barat di Bandung;",
          "Kepala Badan Pengelolaan Keuangan dan Aset Daerah Provinsi Jawa Barat di Bandung;",
          "Kepala Sub Bagian Keuangan dan Aset Dinas Pendidikan Provinsi Jawa Barat di Bandung;",
          `${peg.unitKerja || "Kepala SMA/SMK Bersangkutan"};`,
          "Pegawai Yang bersangkutan untuk diketahui dan digunakan seperlunya."
        ] : [
          "Kepala Dinas Pendidikan Provinsi Jawa Barat di Bandung;",
          "Kepala Badan Pengelolaan Keuangan dan Aset Daerah Provinsi Jawa Barat di Bandung;",
          "Kepala Subbag Tata Usaha Dinas Pendidikan Provinsi Jawa Barat di Bandung;",
          "Pegawai Yang bersangkutan. Untuk diketahui dan digunakan seperlunya."
        ];

        return (
          <div 
            key={peg.id} 
            className="print:m-0 print-page" 
            style={{ pageBreakAfter: "always", breakAfter: "page" }}
          >
            <PrintTemplate
              pegawai={peg}
              settings={settings}
              nomorSurat={nomorSurat}
              tanggalSurat={tanggalSurat}
              tembusanList={tembusanList}
            />
          </div>
        );
      })}
    </div>
  </>
  );
}
