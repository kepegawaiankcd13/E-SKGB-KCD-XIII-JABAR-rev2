/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Settings, 
  MapPin, 
  Signature, 
  Check, 
  Info,
  Scale,
  RefreshCw,
  Sparkles,
  Image,
  Layers,
  FileCheck
} from "lucide-react";
import { SystemSettings, KopLetterhead, SpesimenTtd } from "../types";

interface SettingsPanelProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onLogActivity: (action: string, detail: string) => void;
}

export default function SettingsPanel({ 
  settings, 
  onUpdateSettings,
  onLogActivity 
}: SettingsPanelProps) {
  
  // Helper to format name and preserve academic casing of titles (degrees)
  const formatNamaDanGelar = (namaLengkap: string) => {
    if (!namaLengkap) return "";
    const commaIdx = namaLengkap.indexOf(",");
    if (commaIdx !== -1) {
      const namaUtama = namaLengkap.slice(0, commaIdx).toUpperCase().trim();
      const gList = namaLengkap.slice(commaIdx).trim(); // Keep original casing of degrees
      return `${namaUtama}${gList}`;
    }
    return namaLengkap.toUpperCase().trim();
  };

  // Tab control
  const [activeTab, setActiveTab] = useState<"kop" | "tte">("kop");

  // Local state for letterhead kop
  const [pemdaLine, setPemdaLine] = useState(settings.kop.pemdaLine);
  const [dinasLine, setDinasLine] = useState(settings.kop.dinasLine);
  const [cabdisLine, setCabdisLine] = useState(settings.kop.cabdisLine);
  const [alamat, setAlamat] = useState(settings.kop.alamat);
  const [kontak, setKontak] = useState(settings.kop.kontak);
  const [kabupatenZip, setKabupatenZip] = useState(settings.kop.kabupatenZip);
  const [logoType, setLogoType] = useState<"jabar" | "custom" | "upload">(
    settings.kop.logoUrl && settings.kop.logoUrl.startsWith("data:")
      ? "upload"
      : settings.kop.logoUrl
      ? "custom"
      : "jabar"
  );
  const [logoUrl, setLogoUrl] = useState(settings.kop.logoUrl || "https://upload.wikimedia.org/wikipedia/commons/9/99/Coat_of_arms_of_West_Java.svg");
  const [useFullImage, setUseFullImage] = useState(settings.kop.useFullImage || false);
  const [fullImageUrl, setFullImageUrl] = useState(settings.kop.fullImageUrl || "");

  // Local state for spesimen ttd
  const [namaPejabat, setNamaPejabat] = useState(settings.spesimen.namaPejabat);
  const [pangkatPangkat, setPangkatPangkat] = useState(settings.spesimen.pangkatPangkat);
  const [golonganRuang, setGolonganRuang] = useState(settings.spesimen.golonganRuang || "");
  const [nip, setNip] = useState(settings.spesimen.nip);
  const [jabatanLengkap, setJabatanLengkap] = useState(settings.spesimen.jabatanLengkap);
  const [useTTEForPPPK, setUseTTEForPPPK] = useState(settings.spesimen.useTTEForPPPK);
  const [useTTEForPNS, setUseTTEForPNS] = useState(settings.spesimen.useTTEForPNS);

  // States for TTE Specimen Parameter Tab (as requested in the UI mock)
  const [syncPejabatActive, setSyncPejabatActive] = useState(true);
  const [tteLogoType, setTteLogoType] = useState<"bawaan" | "url" | "upload">(
    settings.spesimen.tteLogoType || "bawaan"
  );
  const [tteHeader, setTteHeader] = useState(
    settings.spesimen.tteHeader || "Ditandatangani secara elektronik oleh :"
  );
  const [customTteLogoUrl, setCustomTteLogoUrl] = useState(
    settings.spesimen.customTteLogoUrl || ""
  );

  // Regulasi
  const [regulasiPNS, setRegulasiPNS] = useState(settings.regulasiPNS);
  const [regulasiPPPK, setRegulasiPPPK] = useState(settings.regulasiPPPK);

  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  // Custom Jabar Logo SVG for Kop preview
  const JabarLogoSVG = () => (
    <svg className="w-16 h-18 shrink-0 select-none" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <path d="M50,10 C85,10 90,35 90,65 C90,95 50,115 50,115 C50,115 10,95 10,65 C10,35 15,10 50,10 Z" fill="#0b5e3a" stroke="#d4af37" strokeWidth="3" />
      <path d="M50,15 C78,15 82,38 82,65 C82,88 50,106 50,106 C50,106 18,88 18,65 C18,38 22,15 50,15 Z" fill="#137c4f" stroke="#eeca3a" strokeWidth="1.5" />
      <rect x="46" y="35" width="8" height="40" fill="#ffffff" />
      <polygon points="42,35 50,22 58,35" fill="#ffd700" stroke="#b8860b" strokeWidth="1" />
      <line x1="50" y1="22" x2="50" y2="17" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="50" cy="16" r="2.5" fill="#f43f5e" />
      <path d="M28,60 C28,45 42,45 42,60 C42,75 28,75 28,60 Z M72,60 C72,45 58,45 58,60 C58,75 72,75 72,60 Z" fill="#ffd700" opacity="0.8" />
      <path d="M15,90 Q50,105 85,90" fill="none" stroke="#eeca3a" strokeWidth="8" strokeLinecap="round" />
      <path d="M15,90 Q50,105 85,90" fill="none" stroke="#003366" strokeWidth="5" strokeLinecap="round" />
      <path id="previewRibbonText" d="M18,91 Q50,106 82,91" fill="none" />
      <text fontFamily="Arial" fontSize="4.5" fontWeight="bold" fill="#ffffff" textAnchor="middle">
        <textPath href="#previewRibbonText" startOffset="50%">
          GEMAH RIPAH
        </textPath>
      </text>
    </svg>
  );

  const presets = [
    {
      name: "Provinsi Jawa Barat (Default)",
      sub: "PEMERINTAH DAERAH PROVINSI JAWA BARAT • DINAS PENDIDIKAN",
      pemda: "PEMERINTAH DAERAH PROVINSI JAWA BARAT",
      dinas: "DINAS PENDIDIKAN",
      cabdis: "CABANG DINAS PENDIDIKAN WILAYAH XIII",
      alamat: "Jalan Dr. Radjiman No. 6 Telp (022) 4264813 Fax. (022) 4264881",
      kontak: "Website : disdik.jabarprov.go.id / e-mail: disdik@jabarprov.go.id / sekretariatdisdikjabar@gmail.com",
      zip: "BANDUNG - 40171"
    },
    {
      name: "Provinsi DKI Jakarta",
      sub: "PEMERINTAH PROVINSI DKI JAKARTA • DINAS PENDIDIKAN",
      pemda: "PEMERINTAH PROVINSI DKI JAKARTA",
      dinas: "DINAS PENDIDIKAN",
      cabdis: "SUKU DINAS PENDIDIKAN WILAYAH JAKARTA TIMUR",
      alamat: "Jl. Raden Inten II No. 34, Duren Sawi",
      kontak: "Website: disdik.jakarta.go.id | Email: jaktim@disdik.mail.go.id",
      zip: "JAKARTA TIMUR - 13440"
    },
    {
      name: "Kabupaten Bogor",
      sub: "PEMERINTAH KABUPATEN BOGOR • DINAS PENDIDIKAN",
      pemda: "PEMERINTAH KABUPATEN BOGOR",
      dinas: "DINAS PENDIDIKAN",
      cabdis: "BADAN KEPEGAWAIAN DAN PENGEMBANGAN SDM",
      alamat: "Jl. Bersih No. 1 Komplek Perkantoran Pemda Cibinong",
      kontak: "Telp: (021) 8752456 / Fax: (021) 8752457",
      zip: "BOGOR - 16914"
    },
    {
      name: "Kota Bandung",
      sub: "PEMERINTAH KOTA BANDUNG • DINAS PENDIDIKAN",
      pemda: "PEMERINTAH KOTA BANDUNG",
      dinas: "DINAS PENDIDIKAN",
      cabdis: "SEKSI TENAGA PENDIDIK DAN KEPENDIDIKAN",
      alamat: "Jl. Jenderal Ahmad Yani No. 239 Bandung",
      kontak: "email: disdik@bandung.go.id | Telp: (022) 7106540",
      zip: "BANDUNG - 40113"
    },
    {
      name: "Model Minimalis (Tanpa Logo)",
      sub: "ADMINISTRATOR DINAS PENDIDIKAN • PANITIA TIM PENILAI",
      pemda: "SEKRETARIAT DAERAH PROVINSI JAWA BARAT",
      dinas: "BIRO ORGANISASI DAN KEPEGAWAIAN",
      cabdis: "BIDANG DATA DAN SISTEM INFORMASI",
      alamat: "Gedung Sate Jl. Diponegoro No. 22 Bandung",
      kontak: "Telp (022) 4233345 | Fax (022) 4233346 | Email: info@jabarprov.go.id",
      zip: "BANDUNG - 40115"
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setPemdaLine(preset.pemda);
    setDinasLine(preset.dinas);
    setCabdisLine(preset.cabdis);
    setAlamat(preset.alamat);
    setKontak(preset.kontak);
    setKabupatenZip(preset.zip);
    onLogActivity("Gunakan Preset KOP", `Menerapkan preset cepat kop surat untuk ${preset.name}`);
  };

  const handleResetKopDefault = () => {
    applyPreset(presets[0]);
    setLogoType("jabar");
    setLogoUrl("https://upload.wikimedia.org/wikipedia/commons/9/99/Coat_of_arms_of_West_Java.svg");
  };

  const compressAndSetImage = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number,
    onSuccess: (base64: string) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate size keeping aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
          const compressed = canvas.toDataURL(mimeType, quality);
          onSuccess(compressed);
        }
      };
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFullKopUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressAndSetImage(file, 1200, 300, 0.8, (base64) => {
        setFullImageUrl(base64);
        onLogActivity("Upload Kop Surat", "Mengunggah gambar baru untuk Kop Surat utuh");
      });
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: SystemSettings = {
      kop: {
        pemdaLine,
        dinasLine,
        cabdisLine,
        alamat,
        kontak,
        kabupatenZip,
        logoUrl: (logoType === "custom" || logoType === "upload") ? logoUrl : undefined,
        useFullImage,
        fullImageUrl: useFullImage ? fullImageUrl : undefined
      },
      spesimen: {
        namaPejabat,
        pangkatPangkat,
        golonganRuang: golonganRuang || undefined,
        nip,
        jabatanLengkap,
        useTTEForPPPK,
        useTTEForPNS,
        tteSecuredText: `${tteHeader} ${jabatanLengkap.toUpperCase()}, ${namaPejabat} ${pangkatPangkat} NIP. ${nip}`,
        tteLogoType,
        tteHeader,
        customTteLogoUrl
      },
      nomorSuratCounter: settings.nomorSuratCounter,
      regulasiPNS,
      regulasiPPPK
    };

    onUpdateSettings(payload);
    onLogActivity(
      "Ubah Pengaturan",
      `Mengubah konfigurasi umum sistem (KOP surat, spesimen ttd pejabat ${namaPejabat}, preferensi penandatanganan elektronik).`
    );

    setIsSavedSuccessfully(true);
    setTimeout(() => {
      setIsSavedSuccessfully(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Tab Switcher mimicking the Jabar portal precisely */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("kop")}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 outline-none cursor-pointer ${
            activeTab === "kop"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Settings size={16} />
          <span>1. Atur Kop & Logo Surat</span>
        </button>
        <button
          onClick={() => setActiveTab("tte")}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 outline-none cursor-pointer relative ${
            activeTab === "tte"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles size={16} className={activeTab === "tte" ? "text-indigo-600 animate-pulse" : ""} />
          <span>2. Set Spesimen TTE</span>
          <span className="absolute -top-1 right-2 bg-rose-500 text-[8px] text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
            BARU
          </span>
        </button>
      </div>

      {isSavedSuccessfully && (
        <div className="max-w-4xl mx-auto px-4 py-3 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in-50">
          <Check size={16} className="text-indigo-600 animate-bounce" />
          <span>Konfigurasi instansi berhasil disimpan dan didistribusikan ke database secara real-time!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">

        {/* TAB 1: KOP SURAT ATURAN */}
        {activeTab === "kop" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
            
            {/* SELECTOR MODE */}
            <div className="lg:col-span-12 bg-slate-50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></span>
                  <span>Metode KOP Surat Utama</span>
                </h4>
                <p className="text-[11px] text-slate-605 leading-snug">
                  Pilih apakah ingin menggunakan form teks per baris (bawaan) atau langsung mengunggah gambar KOP Surat utuh secara penuh untuk menyesuaikan lebar kertas.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setUseFullImage(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all border cursor-pointer ${
                    !useFullImage 
                      ? "bg-slate-900 border-slate-900 text-white shadow" 
                      : "bg-white border-slate-250 text-slate-705 hover:bg-slate-100/80 hover:text-slate-950"
                  }`}
                >
                  Model Teks & Logo Bawaan
                </button>
                <button
                  type="button"
                  onClick={() => setUseFullImage(true)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all border cursor-pointer flex items-center gap-1.5 ${
                    useFullImage 
                      ? "bg-slate-900 border-slate-900 text-white shadow" 
                      : "bg-white border-slate-250 text-slate-705 hover:bg-slate-100/80 hover:text-slate-950"
                  }`}
                >
                  <span>Model Gambar KOP Utuh</span>
                  <span className="bg-amber-400 text-slate-950 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">AKTIF</span>
                </button>
              </div>
            </div>

            {/* LEFT AREA: KOP PREVIEW MOCKUP */}
            <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse"></span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                    Preview Tampilan Kop Saat Ini (Kertas F4 / A4)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleResetKopDefault}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-950 font-bold text-xs rounded-lg transition-colors cursor-pointer border border-rose-100"
                >
                  Setel Ulang Default
                </button>
              </div>

              {/* Real Jabar Kop Mockup Sheet representation */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col items-center">
                <div className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-3 select-none">
                  Mockup Dinamis Kop Resmi
                </div>
                
                {useFullImage ? (
                  <div className="bg-white border border-slate-350 shadow-md p-2 max-w-3xl w-full flex items-center justify-center min-h-[140px] relative select-none overflow-hidden">
                    {fullImageUrl ? (
                      <img 
                        src={fullImageUrl} 
                        alt="Kop Surat Utuh" 
                        className="w-full h-auto max-h-[130px] object-contain block" 
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 py-8 gap-1 italic">
                        <Image size={32} className="stroke-1 text-slate-300" />
                        <span className="text-xs">Belum ada gambar KOP yang diunggah</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="bg-white border border-slate-350 shadow-md p-6 max-w-3xl w-full flex items-center space-x-6 min-h-[140px] relative select-none">
                      
                      {/* Logo column */}
                      <div className="shrink-0">
                        {logoType === "jabar" ? (
                          <JabarLogoSVG />
                        ) : (
                          <img 
                            src={logoUrl} 
                            alt="Logo Kustom" 
                            referrerPolicy="no-referrer"
                            className="w-16 h-18 object-contain shrink-0" 
                            onError={() => {
                              setLogoType("jabar");
                            }}
                          />
                        )}
                      </div>

                      {/* Lines metadata */}
                      <div className="flex-1 text-center font-sans pr-4">
                        <h1 className="text-xs md:text-sm font-extrabold text-black uppercase leading-tight">
                          {pemdaLine || "NAMA PEMERINTAH DAERAH"}
                        </h1>
                        <h2 className="text-[11px] md:text-xs font-bold text-black uppercase leading-snug">
                          {dinasLine || "NAMA INSTANSI PEMBIDANG"}
                        </h2>
                        <h3 className="text-[11px] md:text-xs font-extrabold text-blue-600 uppercase leading-snug">
                          {cabdisLine || "CABANG DINAS PENDIDIKAN WILAYAH XIII"}
                        </h3>
                        <p className="text-[9px] text-slate-705 font-medium mt-0.5 leading-snug">
                          {alamat || "Alamat Jalan Lengkap"}
                        </p>
                        <p className="text-[8.5px] text-slate-500 italic leading-snug">
                          {kontak || "Kontak / Email / Website"}
                        </p>
                        <p className="text-[10px] text-black font-extrabold uppercase mt-0.5 tracking-wider">
                          {kabupatenZip || "KOTA & KODE POS"}
                        </p>
                      </div>
                    </div>

                    {/* Double boundary lines */}
                    <div className="w-full max-w-3xl mt-1 space-y-0.5">
                      <div className="h-0.75 bg-black w-full" />
                      <div className="h-0.25 bg-black w-full" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* LOWER FORM & PRESETS GRID */}
            {!useFullImage ? (
              <>
                <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <MapPin size={16} className="text-indigo-600" />
                    <span>Parameter Form Kop Surat</span>
                  </h3>

                  <div className="space-y-4">
                    
                    {/* Logo custom switcher */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-750 block font-sans">Tipe Logo di Kop</span>
                      <div className="grid grid-cols-3 gap-2 max-w-md">
                        <button
                          type="button"
                          onClick={() => setLogoType("jabar")}
                          className={`py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                            logoType === "jabar" 
                              ? "bg-slate-900 border-slate-900 text-white" 
                              : "bg-white border-slate-250 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          Logo Jabar (SVG)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoType("custom")}
                          className={`py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                            logoType === "custom" 
                              ? "bg-slate-900 border-slate-900 text-white" 
                              : "bg-white border-slate-250 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          URL Gambar
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoType("upload")}
                          className={`py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                            logoType === "upload" 
                              ? "bg-slate-900 border-slate-900 text-white" 
                              : "bg-white border-slate-250 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          Unggah File
                        </button>
                      </div>
                    </div>

                    {/* Custom Logo URL inputs */}
                    {logoType === "custom" && (
                      <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl animate-in slide-in-from-top-2">
                        <label className="text-xs font-bold text-slate-700 block">🌐 URL Logo Kustom</label>
                        <input
                          type="text"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="e.g. https://domain.com/segel.png"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-xs focus:border-indigo-500 focus:outline-none font-mono"
                        />
                        <span className="text-[10px] text-slate-400">Pastikan URL gambar valid dan dihosting pada layanan publik.</span>
                      </div>
                    )}

                    {/* Custom Logo Upload inputs */}
                    {logoType === "upload" && (
                      <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl animate-in slide-in-from-top-2">
                        <label className="text-xs font-bold text-slate-700 block">📁 Unggah File Logo Kustom</label>
                        <p className="text-[10px] text-slate-400 mb-1.5">Mendukung file logo instansi (PNG, JPG, JPEG, SVG) sebagai ganti logo Jawa Barat.</p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            id="kopLogoFileInput"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                compressAndSetImage(file, 200, 200, 0.85, (base64) => {
                                  setLogoUrl(base64);
                                  onLogActivity("Upload Logo KOP", `Berhasil mengunggah file logo KOP: ${file.name}`);
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="kopLogoFileInput"
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-xs font-extrabold rounded-xl cursor-pointer border border-transparent shadow-sm inline-flex items-center gap-2"
                          >
                            <Image size={14} />
                            <span>Pilih File Logo</span>
                          </label>

                          {logoUrl && logoUrl.startsWith("data:") && (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                              <Check size={12} />
                              <span>Siap Disimpan (File Lokal)</span>
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Main Lines parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Baris 1 (Nama Pemerintah Daerah)</label>
                        <input
                          type="text"
                          required
                          value={pemdaLine}
                          onChange={(e) => setPemdaLine(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Baris 2 (Nama Instansi Pembiding)</label>
                        <input
                          type="text"
                          required
                          value={dinasLine}
                          onChange={(e) => setDinasLine(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Baris 3 (Cabang Dinas / Satker)</label>
                        <input
                          type="text"
                          required
                          value={cabdisLine}
                          onChange={(e) => setCabdisLine(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:border-indigo-500 focus:outline-none font-semibold text-blue-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Baris 6 (Nama Kota & Kode Pos)</label>
                        <input
                          type="text"
                          required
                          value={kabupatenZip}
                          onChange={(e) => setKabupatenZip(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:border-indigo-500 focus:outline-none font-semibold"
                        />
                      </div>

                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Baris 4 (Alamat Lengkap & Telepon)</label>
                        <input
                          type="text"
                          required
                          value={alamat}
                          onChange={(e) => setAlamat(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 col-span-1 md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Baris 5 (Surel / Email Resmi / Web)</label>
                        <input
                          type="text"
                          required
                          value={kontak}
                          onChange={(e) => setKontak(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:border-indigo-500 focus:outline-none italic"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* PRESETS SIDE PANEL */}
                <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <Layers size={14} className="text-indigo-600" />
                    <span>Preset Dinas Pendidikan</span>
                  </h3>
                  <p className="text-[11px] text-slate-550 leading-relaxed">
                    Memulai dengan cepat! Pilih salah satu template dinas yang sesuai di bawah ini untuk mengisi seluruh elemen Kop Surat fungsional secara otomatis.
                  </p>

                  <div className="space-y-2 pt-2">
                    {presets.map((preset, index) => {
                      const isCurrent = pemdaLine === preset.pemda && dinasLine === preset.dinas;
                      return (
                        <button
                          type="button"
                          key={index}
                          onClick={() => applyPreset(preset)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer group flex items-start gap-2.5 ${
                            isCurrent 
                              ? "bg-indigo-50/50 border-indigo-400 text-indigo-950" 
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50/30"
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isCurrent ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
                          }`}>
                            {isCurrent && <Check size={10} strokeWidth={3} />}
                          </div>
                          <div className="space-y-0.5 flex-1 min-w-0">
                            <span className="font-bold text-xs block truncate group-hover:text-indigo-900 leading-tight">
                              {preset.name}
                            </span>
                            <span className="text-[9px] text-slate-400 block truncate font-mono uppercase">
                              {preset.sub}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Image className="text-indigo-600 w-5 h-5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Unggah Gambar KOP Surat Utuh</h3>
                    <p className="text-xs text-slate-400">Konfigurasikan gambar KOP instansi utuh untuk melengkapi berkas fisik cetak.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Selector / Dropzone */}
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-slate-700 block">Pilih berkas gambar KOP Surat Anda</span>
                    
                    <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/10 hover:bg-indigo-50/30 border-indigo-300 rounded-2xl p-8 text-center transition-all relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFullKopUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                          <Image size={24} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-indigo-950 block">Seret & lepas atau klik untuk unggah gambar</span>
                          <span className="text-[10px] text-slate-400 block mt-1">PNG, JPG, JPEG (Maks. 3MB)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block font-sans">Atau masukkan URL gambar secara manual</label>
                      <input 
                        type="text"
                        value={fullImageUrl}
                        onChange={(e) => setFullImageUrl(e.target.value)}
                        placeholder="e.g. https://domain-anda.com/images/kop-surat-wilayah13.png"
                        className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:border-indigo-500 focus:outline-none font-mono"
                      />
                      <span className="text-[10px] text-zinc-400 block">Link image harus berupa URL link publik atau Base64.</span>
                    </div>
                  </div>

                  {/* Right Column: Information & Preset */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase text-indigo-950 tracking-wider flex items-center gap-1.5 pb-1 border-b border-indigo-100/50 font-sans">
                        <Info size={14} className="text-indigo-600" />
                        <span>Panduan Penggunaan KOP Surat Utuh</span>
                      </h4>
                      <ul className="text-[11px] text-slate-600 space-y-2 list-disc pl-4 leading-relaxed font-sans">
                        <li>Pastikan gambar KOP memiliki margin kiri dan kanan yang simetris agar posisi tercetak lurus.</li>
                        <li>Sistem secara otomatis akan meregangkan/menyesuaikan gambar KOP Anda hingga sejajar dengan lebar kertas cetak F4/A4 fungsional.</li>
                        <li>Ukuran optimal gambar KOP adalah sekitar <b className="text-indigo-950">1200 x 240 pixel</b> atau dengan rasio <b className="text-indigo-950">5:1</b>.</li>
                        <li>Jika menggunakan opsi ini, baris teks KOP dan logo default di form sebelumnya akan otomatis diabaikan pada lembar cetak SK.</li>
                      </ul>
                    </div>

                    {/* Preloaded quick Ciamis Kop preset directly from user's attached reference */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Opsi Preset Gambar Cepat:</span>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFullImageUrl("https://i.ibb.co.com/8gWND9r2/image.png");
                            onLogActivity("Preset Gambar KOP", "Mengaktifkan preset gambar KOP Cabdis XIII Jabar");
                          }}
                          className="text-left text-xs p-3 bg-white hover:bg-indigo-50/20 border border-slate-200 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                            KCD
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block text-xs leading-tight font-sans">Gunakan KOP Cabang Dinas Wilayah XIII</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">CIAMIS - Jawa Barat (Faktual)</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: SPESIMEN & TTE */}
        {activeTab === "tte" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
            
            {/* HERO BAR DETAILED DESCRIPTION */}
            <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase text-indigo-700">
                <Sparkles size={16} className="text-indigo-600" />
                <span>Menu Khusus: Parameter Pembubuhan Gambar Spesimen TTE (Global)</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Formulir ini berfungsi khusus untuk mengonfigurasi logo segel digital (Barcode/QR, Tanda Tangan Basah/TTE) yang dicetak di berkas kenaikan gaji berkala. Seluruh dokumen guru secara otomatis akan mengadaptasi spesimen ini secara dinamis.
              </p>
            </div>

            {/* SYNC INDICATOR */}
            <div className="lg:col-span-12">
              <div className="bg-emerald-50/40 border-2 border-emerald-500/10 p-4 rounded-2xl flex items-start gap-3.5 shadow-xs">
                <input
                  type="checkbox"
                  id="syncOption"
                  checked={syncPejabatActive}
                  onChange={(e) => setSyncPejabatActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 mt-0.5 focus:ring-emerald-500"
                />
                <div>
                  <label htmlFor="syncOption" className="font-bold text-emerald-950 cursor-pointer text-xs md:text-sm flex items-center gap-1.5 select-none">
                    Sinkronisasi Jabatan & Nama Unit Kerja Pejabat Secara Otomatis (Rekomendasi)
                  </label>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    Harap centang ini agar data Jabatan dan Unit Kerja serta Nama pejabat penilai langsung disalin secara cerdas dari form penilai masing-masing. Anda tidak perlu mengetik ulang secara manual!
                  </p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded mt-2.5 select-none">
                    ✓ FITUR OTOMATIS AKTIF (MENYALIN NAMA JABATAN & UNIT KERJA SECARA REAL-TIME)
                  </span>
                </div>
              </div>
            </div>

            {/* FORM PARAMETERS INPUTS */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
              
              <div className="space-y-4">
                
                {/* Logo Customizer */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">Tipe Logo Spesimen TTE</span>
                  <div className="grid grid-cols-3 gap-2 max-w-md">
                    {["bawaan", "url", "upload"].map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setTteLogoType(type as any)}
                        className={`py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                          tteLogoType === type 
                            ? "bg-slate-900 border-slate-900 text-white" 
                            : "bg-white border-slate-250 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {type === "bawaan" && "Bawaan (Digital)"}
                        {type === "url" && "URL Gambar"}
                        {type === "upload" && "Unggah File"}
                      </button>
                    ))}
                  </div>
                </div>

                {tteLogoType !== "bawaan" && (
                  <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl animate-in slide-in-from-top-2">
                    {tteLogoType === "url" ? (
                      <>
                        <label className="text-xs font-bold text-slate-700 block">
                          🌐 URL Gambar Segel / Barcode
                        </label>
                        <input
                          type="text"
                          value={customTteLogoUrl}
                          onChange={(e) => setCustomTteLogoUrl(e.target.value)}
                          placeholder="e.g. https://domain.com/my-tte-sign.png"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-xs focus:border-indigo-500 focus:outline-none font-mono"
                        />
                      </>
                    ) : (
                      <>
                        <label className="text-xs font-bold text-slate-700 block">
                          📁 Unggah File Gambar Spesimen TTE Baru
                        </label>
                        <p className="text-[10px] text-slate-400 mb-1.5">Mendukung format PNG, JPG, JPEG, atau SVG dengan latar belakang transparan.</p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            id="tteLogoFileInput"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                compressAndSetImage(file, 400, 400, 0.85, (base64) => {
                                  setCustomTteLogoUrl(base64);
                                  onLogActivity("Simpan Spesimen TTE", `Berhasil mengunggah file gambar spesimen: ${file.name}`);
                                });
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="tteLogoFileInput"
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-xs font-extrabold rounded-xl cursor-pointer border border-transparent shadow-sm inline-flex items-center gap-2"
                          >
                            <Image size={14} />
                            <span>Pilih File Gambar</span>
                          </label>

                          {customTteLogoUrl && customTteLogoUrl.startsWith("data:") && (
                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                              <Check size={12} />
                              <span>Siap Disimpan (Local File)</span>
                            </span>
                          )}
                        </div>

                        {/* Preview raw file within box */}
                        {customTteLogoUrl && (
                          <div className="mt-3 p-2 bg-white border border-slate-200 rounded-lg max-w-[120px] flex items-center justify-center relative group">
                            <img 
                              src={customTteLogoUrl} 
                              alt="TTE Upload Preview" 
                              className="max-h-16 object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => setCustomTteLogoUrl("")}
                              className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 text-[8px] font-bold cursor-pointer hover:bg-rose-700 w-4 h-4 flex items-center justify-center shadow"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Teks Header Spesimen</label>
                  <input
                    type="text"
                    required
                    value={tteHeader}
                    onChange={(e) => setTteHeader(e.target.value)}
                    placeholder="e.g. Ditandatangani secara elektronik oleh :"
                    className="w-full px-3.5 py-2.5 border border-slate-250 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Teks Jabatan Baris 1</label>
                  <input
                    type="text"
                    disabled={syncPejabatActive}
                    value={syncPejabatActive ? "[MENYALIN OTOMATIS DARI DATA PEJABAT PENILAI]" : jabatanLengkap.toUpperCase()}
                    onChange={(e) => !syncPejabatActive && setJabatanLengkap(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-250 bg-slate-50 disabled:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold focus:outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Teks Jabatan Baris 2</label>
                  <input
                    type="text"
                    disabled
                    value="[MENYALIN OTOMATIS DARI DATA PEJABAT PENILAI]"
                    className="w-full px-3.5 py-2.5 border border-slate-250 bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold focus:outline-none font-sans"
                  />
                </div>

                {/* ORIGINAL HEAD OFFICER KREDENSIAL */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="flex items-center gap-1.5">
                    <FileCheck size={16} className="text-indigo-650" />
                    <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Pejabat Definitif Kepala Cabang Dinas</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-705">Nama Pejabat (Lengkap)</label>
                      <input
                        type="text"
                        required
                        value={namaPejabat}
                        onChange={(e) => setNamaPejabat(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none font-semibold text-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-705">NIP Pejabat</label>
                      <input
                        type="text"
                        required
                        value={nip}
                        onChange={(e) => setNip(e.target.value.replace(/\s+/g, ""))}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-705">Jabatan Resmi Definitif</label>
                      <input
                        type="text"
                        required
                        value={jabatanLengkap}
                        onChange={(e) => setJabatanLengkap(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-705">Pangkat</label>
                        <input
                          type="text"
                          required
                          value={pangkatPangkat}
                          onChange={(e) => setPangkatPangkat(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-705">Golongan</label>
                        <input
                          type="text"
                          value={golonganRuang}
                          onChange={(e) => setGolonganRuang(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PNS vs PPPK toggle choices */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block uppercase mb-1">Mekanisme Penerbitan Otomatis</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* PPPK */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-slate-900 block leading-tight">Pegawai PPPK</span>
                          <span className="text-[9px] text-slate-400">Rekomendasi: TTE Dinamis</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUseTTEForPPPK(!useTTEForPPPK)}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border cursor-pointer ${
                            useTTEForPPPK 
                              ? "bg-indigo-50 border-indigo-400 text-indigo-850" 
                              : "bg-white border-slate-250 text-slate-550"
                          }`}
                        >
                          {useTTEForPPPK ? "TTE Aktif" : "Manual (Blank)"}
                        </button>
                      </div>

                      {/* PNS */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-slate-900 block leading-tight">Pegawai PNS</span>
                          <span className="text-[9px] text-slate-400">Rekomendasi: Manual (Blank)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUseTTEForPNS(!useTTEForPNS)}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border cursor-pointer ${
                            useTTEForPNS 
                              ? "bg-indigo-50 border-indigo-400 text-indigo-850" 
                              : "bg-white border-slate-250 text-slate-550"
                          }`}
                        >
                          {useTTEForPNS ? "TTE Aktif" : "Manual (Blank)"}
                        </button>
                      </div>
                    </div>
                    
                    {/* PHYSICAL WET SIGN NOTE */}
                    <p className="text-[10px] text-slate-505 leading-relaxed italic bg-amber-500/5 text-amber-900 border border-amber-500/10 p-2.5 rounded-lg mt-3">
                      💡 <strong>Catatan Teknis:</strong> Sesuai instruksi Anda, metode <strong>Manual</strong> dikonfigurasi 100% murni kosong / blank space tanpa cap digital agar siap dicetak dengan kertas fisik untuk kemudian ditandatangani basah dan diberi cap dinas timbul / tinta biru secara fisik.
                    </p>
                  </div>

                </div>

              </div>
            </div>

            {/* PREVIEW ACTIVE TTE SPECIMEN BOX CARD */}
            <div className="lg:col-span-4 space-y-4">
              
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Preview TTE Spesimen Aktif
                </span>

                {/* Mock Sheet segment with barcode box */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <div className="text-[9px] font-semibold text-slate-400 uppercase text-center tracking-widest mb-3 border-b border-slate-200 pb-1.5">
                    Lembar TTE PAK / KGB
                  </div>

                  <div className="border border-black bg-white rounded-[16px] p-3.5 flex items-center gap-4 w-full select-none shadow-sm">
                    {/* TTE block indicator box */}
                    <div className="w-[72px] h-[72px] bg-white shrink-0 flex items-center justify-center overflow-hidden">
                      {tteLogoType !== "bawaan" && customTteLogoUrl ? (
                        <img 
                          src={customTteLogoUrl} 
                          alt="TTE Segel" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        /* High-fidelity SVG of the BSrE/Jabar style digital signature seal */
                        <svg viewBox="0 0 100 100" className="w-[68px] h-[68px]" xmlns="http://www.w3.org/2000/svg">
                          {/* Top dots */}
                          <circle cx="50" cy="15" r="3" fill="#0ea5e9" />
                          <circle cx="50" cy="23" r="3" fill="#0ea5e9" />
                          <circle cx="50" cy="31" r="3" fill="#0ea5e9" />
                          
                          {/* Left and right brackets/capsules resembling fingerprint */}
                          <path d="M40,35 H60" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
                          <path d="M30,42 H70" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                          
                          {/* Fingerprint ridges */}
                          <path d="M42,50 C42,46 58,46 58,50 C58,62 46,62 46,72" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                          <path d="M36,50 C36,41 64,41 64,50 C64,68 52,68 52,78 M52,84" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                          <path d="M30,50 C30,36 70,36 70,50 C70,74 58,74 58,84" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                          
                          {/* Verification badge/shield decor */}
                          <circle cx="36" cy="56" r="2.5" fill="#0ea5e9" />
                          <circle cx="64" cy="56" r="2.5" fill="#10b981" />
                        </svg>
                      )}
                    </div>

                    <div className="text-[8px] leading-tight flex-1 text-black font-sans overflow-hidden">
                      <span className="text-slate-800 block italic mb-0.5 leading-normal">
                        {tteHeader}
                      </span>
                      <span className="font-bold text-black block uppercase text-[8.5px] leading-tight tracking-wide mb-1">
                        {syncPejabatActive ? "KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII" : jabatanLengkap.toUpperCase()}
                      </span>
                      <div className="h-1.5" />
                      <span className="font-bold text-black block leading-tight text-[10px] break-words">
                        {formatNamaDanGelar(syncPejabatActive ? "DWI YANTI ESTRININGRUM, S.Sos., M.Pd." : namaPejabat)}
                      </span>
                      <span className="text-slate-700 block text-[7.5px] font-medium font-sans break-words mt-0.5">
                        {syncPejabatActive ? "Pembina Tk. I" : pangkatPangkat}
                        {(!syncPejabatActive && golonganRuang) ? `/${golonganRuang}` : "/IV.b"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* COUPLING WARNING ADVICE COMPONENT */}
              <div className="bg-indigo-900 text-white rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Catatan Sinkronisasi Cloud</span>
                </div>
                <p className="text-[11px] text-indigo-100 leading-normal">
                  Seluruh berkas spesimen dan logo disimpan secara aman di cloud database Firestore dan didistribusikan ke lembar laporan. Proses upload logo hanya perlu dilakukan sekali saja tanpa kuatir hilang sewaktu melakukan logout!
                </p>
              </div>

            </div>

          </div>
        )}

        {/* BOTTOM GLOBAL ACTION BUTTON: Landasan Hukum + Save Button */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Scale size={16} className="text-indigo-650" />
            <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              3. Regulasi & Dasar Aturan Hukum Dasar
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Landasan Hukum Peraturan Gaji PNS</label>
              <input
                type="text"
                required
                value={regulasiPNS}
                onChange={(e) => setRegulasiPNS(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Landasan Hukum Peraturan Gaji PPPK</label>
              <input
                type="text"
                required
                value={regulasiPPPK}
                onChange={(e) => setRegulasiPPPK(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
              <span>Simpan Perubahan Pengaturan</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
