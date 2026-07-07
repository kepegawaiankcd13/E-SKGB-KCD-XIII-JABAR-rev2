/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from "react";
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  ChevronDown, 
  Calendar, 
  Filter, 
  Download, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Award, 
  FileText 
} from "lucide-react";
import { Pegawai, SystemSettings } from "../types";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

interface LaporanSKGBProps {
  pegawaiList: Pegawai[];
  settings: SystemSettings;
}

export default function LaporanSKGB({ pegawaiList, settings }: LaporanSKGBProps) {
  // Report Period Selection
  const [reportType, setReportType] = useState<"bulanan" | "tahunan" | "periode" | "semua">("bulanan");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  const monthsList = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" }
  ];

  // List of available years from the active pegawai list, fallback to last 5 years
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    pegawaiList.forEach(p => {
      if (p.tmtBaru) {
        const year = new Date(p.tmtBaru).getFullYear();
        if (!isNaN(year)) years.add(year);
      }
    });
    // add current year and surrounding years if empty
    const currYear = new Date().getFullYear();
    years.add(currYear);
    years.add(currYear - 1);
    years.add(currYear + 1);
    return Array.from(years).sort((a, b) => b - a);
  }, [pegawaiList]);

  // Filtered Pegawai based on report configuration
  const filteredPegawai = useMemo(() => {
    return pegawaiList.filter(peg => {
      // Search matches
      const matchesSearch = searchQuery === "" || 
        peg.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peg.nip.includes(searchQuery) ||
        peg.unitKerja.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peg.jabatan.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Date matches based on tmtBaru
      if (!peg.tmtBaru) return false;
      const tmtDate = new Date(peg.tmtBaru);
      if (isNaN(tmtDate.getTime())) return false;

      const tmtYear = tmtDate.getFullYear();
      const tmtMonth = tmtDate.getMonth() + 1; // 1-12

      if (reportType === "bulanan") {
        return tmtYear === selectedYear && tmtMonth === selectedMonth;
      } else if (reportType === "tahunan") {
        return tmtYear === selectedYear;
      } else if (reportType === "periode") {
        if (!startDate && !endDate) return true;
        const start = startDate ? new Date(startDate) : new Date("1970-01-01");
        const end = endDate ? new Date(endDate) : new Date("2100-12-31");
        return tmtDate >= start && tmtDate <= end;
      }

      return true; // "semua"
    });
  }, [pegawaiList, reportType, selectedMonth, selectedYear, startDate, endDate, searchQuery]);

  // Derived metrics for summary widgets
  const metrics = useMemo(() => {
    const count = filteredPegawai.length;
    let totalLama = 0;
    let totalBaru = 0;
    let pnsCount = 0;
    let pppkCount = 0;

    filteredPegawai.forEach(p => {
      totalLama += p.gajiPokokLama || 0;
      totalBaru += p.gajiPokokBaru || 0;
      // distinguish PNS vs PPPK by their grade
      const isPPPK = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(p.pangkatGolongan);
      if (isPPPK) pppkCount++;
      else pnsCount++;
    });

    const averageIncrease = count > 0 ? (totalBaru - totalLama) / count : 0;

    return {
      count,
      pnsCount,
      pppkCount,
      averageIncrease,
      difference: totalBaru - totalLama
    };
  }, [filteredPegawai]);

  const rupiahFormat = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDateIndo = (dateStr: string) => {
    if (!dateStr) return "-";
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const selectedMonthLabel = monthsList.find(m => m.value === selectedMonth)?.label || "";

  // Dynamic label for the report subtitle to export
  const reportSubtitle = useMemo(() => {
    if (reportType === "bulanan") return `Periode Bulan ${selectedMonthLabel} ${selectedYear}`;
    if (reportType === "tahunan") return `Periode Tahun ${selectedYear}`;
    if (reportType === "periode") return `Periode ${startDate ? formatDateIndo(startDate) : "Awal"} s.d. ${endDate ? formatDateIndo(endDate) : "Akhir"}`;
    return "Seluruh Data Riwayat SKGB Pegawai";
  }, [reportType, selectedMonthLabel, selectedYear, startDate, endDate]);

  // Export to Excel trigger
  const handleExportExcel = () => {
    if (filteredPegawai.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    // Build plain rows for sheetjs
    const rows = filteredPegawai.map((p, idx) => ({
      "No.": idx + 1,
      "Nama Pegawai": p.nama,
      "NIP": `'${p.nip}`, // prefix single quote for phone/NIP styling in Excel
      "Tempat Lahir": p.tempatLahir || "-",
      "Tanggal Lahir": p.tanggalLahir || "-",
      "No HP": p.noHp || "-",
      "Email": p.email || "-",
      "Pangkat / Golongan Lama": p.pangkatGolongan,
      "Pangkat / Golongan Baru": p.pangkatGolonganBaru || p.pangkatGolongan,
      "Jabatan Lama": p.jabatan,
      "Jabatan Baru": p.jabatanBaru || p.jabatan,
      "Unit Kerja (Sekolah)": p.unitKerja,
      "Gaji Pokok Lama": p.gajiPokokLama,
      "Gaji Pokok Baru": p.gajiPokokBaru,
      "Kenaikan Gaji": p.gajiPokokBaru - p.gajiPokokLama,
      "SK Lama Oleh Pejabat": p.skOlehPejabat || "-",
      "SK Lama Nomor": p.skNomor || "-",
      "SK Lama Tanggal": p.skTanggal || "-",
      "SK Lama TMT Berlaku": p.skTglMulaiBerlaku || "-",
      "SK Lama Masa Kerja Tahun": p.skMasaKerjaTahun,
      "SK Lama Masa Kerja Bulan": p.skMasaKerjaBulan,
      "Masa Kerja Golongan Tahun (Baru)": p.mkTahunBaru,
      "Masa Kerja Golongan Bulan (Baru)": p.mkBulanBaru,
      "Nomor Surat KGB Baru": p.noSuratBaru || "-",
      "Tanggal Surat KGB Baru": p.tglSuratBaru || "-",
      "TMT KGB Baru": p.tmtBaru,
      "TMT Berikutnya (YAD)": p.tmtAkanDatang,
      "Status KGB": p.statusKGB
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan SKGB");

    // Adjust column widths automatically
    const keys = Object.keys(rows[0]);
    const wscols = keys.map(key => {
      let maxLen = key.length;
      rows.forEach(row => {
        const val = (row as any)[key];
        const str = val !== null && val !== undefined ? String(val) : "";
        if (str.length > maxLen) {
          maxLen = str.length;
        }
      });
      return { wch: Math.min(Math.max(maxLen + 3, 10), 50) };
    });
    worksheet["!cols"] = wscols;

    // Trigger save
    const fileName = `Laporan_SKGB_Cabdis_Wil_XIII_${reportType}_${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Trigger print view formatted perfectly
  const handlePrintReport = () => {
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

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLS CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Pusat Laporan & Rekapitulasi SKGB</h2>
            <p className="text-xs text-slate-500">Buat laporan bulanan, periode khusus, atau tahunan untuk kebutuhan arsip dan ekspor.</p>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              disabled={filteredPegawai.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-sm inline-flex items-center space-x-2 cursor-pointer"
            >
              <FileSpreadsheet size={16} />
              <span>Ekspor Excel (.xlsx)</span>
            </button>

            <button
              onClick={handlePrintReport}
              disabled={filteredPegawai.length === 0}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-sm inline-flex items-center space-x-2 cursor-pointer"
            >
              <Printer size={16} />
              <span>Cetak / Ekspor PDF</span>
            </button>
          </div>
        </div>

        {/* CONTROLS BAR: INTERVAL FILTERS */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          
          {/* Interval Type */}
          <div className="col-span-1 lg:col-span-3 space-y-1.5Col">
            <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Metode Periode</label>
            <div className="grid grid-cols-4 gap-1 bg-white p-1 border border-slate-200 rounded-xl">
              {(["bulanan", "tahunan", "periode", "semua"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-colors text-center capitalize ${
                    reportType === type 
                      ? "bg-indigo-600 text-white shadow-xs" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {type === "semua" ? "Semua" : type}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional parameters based on Report Type */}
          <div className="col-span-1 lg:col-span-5 flex gap-2">
            {reportType === "bulanan" && (
              <>
                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">Pilih Bulan</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 font-semibold focus:outline-none"
                  >
                    {monthsList.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="w-28 space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">Tahun</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 font-semibold focus:outline-none font-mono"
                  >
                    {availableYears.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {reportType === "tahunan" && (
              <div className="w-full space-y-1">
                <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">Pilih Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 font-semibold focus:outline-none font-mono"
                >
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>{yr} Masehi</option>
                  ))}
                </select>
              </div>
            )}

            {reportType === "periode" && (
              <div className="w-full flex gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">Dari Tanggal (TMT)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">Sampai Tanggal (TMT)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {reportType === "semua" && (
              <div className="w-full self-center pt-3.5 pl-2 text-xs text-slate-400 font-medium">
                🔒 Seluruh list database pegawai historis akan ditampilkan tanpa batasan waktu.
              </div>
            )}
          </div>

          {/* Quick search filter for matching reports table */}
          <div className="col-span-1 lg:col-span-4 space-y-1">
            <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wide">Cari Cepat di Laporan</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="NIP, nama sekolah, atau guru..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

        </div>
      </div>

      {/* MULTIPLE METRIC CARDS print:hidden */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Jumlah SKGB</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{metrics.count}</p>
          <span className="text-[10px] text-slate-400 font-semibold">SKGB aktif terfilter</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">SKGB PNS</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <UserCheck size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{metrics.pnsCount}</p>
          <span className="text-[10px] text-amber-600 font-bold">Pegawai Negeri Sipil</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">SKGB PPPK</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Award size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{metrics.pppkCount}</p>
          <span className="text-[10px] text-teal-600 font-bold">Pemerintah dg Perjanjian Kerja</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Rerata Kenaikan Gaji</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-600 mt-2 font-mono">{rupiahFormat(metrics.averageIncrease)}</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            Surplus Berkala: {rupiahFormat(metrics.difference)}
          </span>
        </div>

      </div>

      {/* CORE DISPLAY TABLE FOR REPORTS AND EXPORTS */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden print:border-none print:shadow-none print:bg-white">
        
        {/* Printable Official Government Header (Only visible on browser print) */}
        <div className="hidden print:block p-4 mb-4 border-b-2 border-black space-y-1.5 select-none font-sans text-center">
          <h2 className="text-sm font-black text-black tracking-wide uppercase">{settings.kop.pemdaLine}</h2>
          <h3 className="text-xs font-extrabold text-black uppercase">{settings.kop.dinasLine}</h3>
          <h3 className="text-sm font-extrabold text-black uppercase">{settings.kop.cabdisLine}</h3>
          <p className="text-[9px] text-slate-650">{settings.kop.alamat}</p>
          <p className="text-[8px] text-slate-600 italic font-mono">{settings.kop.kontak} Kode Pos {settings.kop.kabupatenZip}</p>
          <div className="h-2" />
          <div className="border-t border-slate-700 my-1 pt-2">
            <h1 className="text-xs font-black uppercase text-black">REKAPITULASI DAFTAR KENAIKAN GAJI BERKALA (KGB)</h1>
            <p className="text-[10px] font-bold text-slate-900">{reportSubtitle}</p>
          </div>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto">
          {filteredPegawai.length === 0 ? (
            <div className="py-16 text-center">
              <FileSpreadsheet size={48} className="mx-auto text-slate-300 mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-700">Tidak Ada Data Riwayat SKGB</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">Sesuaikan kriteria filter periode, bulan atau kata kunci pencarian Anda untuk menampilkan rekapitulasi data.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/90 text-[10px] uppercase font-bold text-slate-700 print:bg-transparent print:border-black print:border-b-2">
                  <th className="py-3 px-4 w-10 text-center print:py-1 print:px-1 print:text-[8px]">No</th>
                  <th className="py-3 px-4 min-w-[150px] print:py-1 print:px-1 print:text-[8px]">Nama & NIP</th>
                  <th className="py-3 px-2 w-14 text-center print:py-1 print:px-1 print:text-[8px]">Jenis</th>
                  <th className="py-3 px-3 print:py-1 print:px-1 print:text-[8px]">Gol</th>
                  <th className="py-3 px-4 min-w-[150px] print:py-1 print:px-1 print:text-[8px]">Jabatan & Unit Kerja</th>
                  <th className="py-3 px-3 text-right print:py-1 print:px-1 print:text-[8px]">Gaji Pokok Lama</th>
                  <th className="py-3 px-3 text-right print:py-1 print:px-1 print:text-[8px]">Gaji Pokok Baru</th>
                  <th className="py-3 px-3 text-center print:py-1 print:px-1 print:text-[8px]">TMT KGB</th>
                  <th className="py-3 px-3 print:py-1 print:px-1 print:text-[8px]">No SKGB</th>
                  <th className="py-3 px-3 text-center print:py-1 print:px-1 print:text-[8px]">TMT YAD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 print:divide-y print:divide-slate-300">
                {filteredPegawai.map((peg, id) => {
                  const isPPPK = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII"].includes(peg.pangkatGolongan);
                  return (
                    <tr key={peg.id} className="hover:bg-slate-50/50 print:hover:bg-transparent transition-colors">
                      <td className="py-3 px-4 text-center font-mono font-medium text-slate-400 print:py-1 print:px-1 print:text-[7.5px] print:text-black">
                        {id + 1}
                      </td>
                      <td className="py-3 px-4 print:py-1 print:px-1 print:text-[7.5px]">
                        <span className="block font-bold text-slate-900 print:text-black">{peg.nama}</span>
                        <span className="block font-mono text-[10px] text-slate-400 mt-0.5 print:text-slate-650 print:font-sans">NIP. {peg.nip}</span>
                      </td>
                      <td className="py-3 px-2 text-center print:py-1 print:px-1 print:text-[7.5px]">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold print:p-0 print:text-black ${
                          isPPPK ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {isPPPK ? "PPPK" : "PNS"}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-755 print:py-1 print:px-1 print:text-[7.5px]">
                        {peg.pangkatGolongan.replace("PENATA ","").replace("PEMBINA ","").replace("MUDA ","")}
                      </td>
                      <td className="py-3 px-4 print:py-1 print:px-1 print:text-[7.5px]">
                        <span className="block font-medium text-slate-800 line-clamp-1 print:text-black">{peg.jabatan}</span>
                        <span className="block text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1 print:text-slate-500">{peg.unitKerja}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-600 print:py-1 print:px-1 print:text-[7.5px] print:text-black">
                        {rupiahFormat(peg.gajiPokokLama).replace("Rp","").trim()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 print:py-1 print:px-1 print:text-[7.5px] print:text-black">
                        {rupiahFormat(peg.gajiPokokBaru).replace("Rp","").trim()}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[11px] font-semibold text-slate-700 print:py-1 print:px-1 print:text-[7.5px]">
                        {formatDateIndo(peg.tmtBaru)}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600 max-w-[120px] truncate print:py-1 print:px-1 print:text-[7.5px] print:text-black">
                        {peg.skNomor || "-"}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[11px] font-semibold text-slate-400 print:py-1 print:px-1 print:text-[7.5px] print:text-slate-700">
                        {formatDateIndo(peg.tmtAkanDatang)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Printable Official Handover / Signature area (Only visible on browser print) */}
        <div className="hidden print:block mt-8 text-[9px] select-none font-sans">
          <div className="flex justify-end pr-8">
            <div className="w-[280px] text-center space-y-12">
              <div>
                <p>Ciamis, {formatDateIndo(new Date().toISOString().split("T")[0])}</p>
                <p className="font-extrabold uppercase mt-0.5">{settings.spesimen.jabatanLengkap}</p>
              </div>
              <div>
                <p className="font-black text-black underline uppercase">{settings.spesimen.namaPejabat}</p>
                <p className="text-slate-700">{settings.spesimen.pangkatPangkat}</p>
                <p className="font-mono mt-0.5">NIP. {settings.spesimen.nip}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination/Table Record Footers print:hidden */}
        <div className="bg-slate-50 px-5 py-4.5 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-medium print:hidden">
          <span>Menampilkan <strong className="text-slate-800 font-bold">{filteredPegawai.length}</strong> pegawai terdaftar terfilter</span>
          <span className="text-[10px] text-slate-400">Gunakan filter periode di bagian atas untuk mencetak rincian lainnya.</span>
        </div>

      </div>

    </div>
  );
}
