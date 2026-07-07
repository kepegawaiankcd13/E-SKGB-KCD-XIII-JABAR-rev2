/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Pegawai, SystemSettings } from "../types";

interface PrintTemplateProps {
  pegawai: Pegawai;
  settings: SystemSettings;
  nomorSurat: string;
  tanggalSurat: string; // YYYY-MM-DD or pre-formatted Indonesian string
  tembusanList: string[];
}

export default function PrintTemplate({
  pegawai,
  settings,
  nomorSurat,
  tanggalSurat,
  tembusanList,
}: PrintTemplateProps) {
  // Helper to format name and preserve academic casing of titles (degrees)
  const formatNamaDanGelar = (namaLengkap: string) => {
    if (!namaLengkap) return "";
    const parts = namaLengkap.split(",");
    let mainName = parts[0];

    // Format prefix degrees if any (Drs., Dra., Ir., Dr., Prof.) at the beginning
    const prefixRegex = /^(drs|dra|ir|dr|prof)\.?\s+/i;
    const prefixMatch = mainName.match(prefixRegex);
    let prefix = "";
    if (prefixMatch) {
      const rawPrefix = prefixMatch[1].toLowerCase();
      if (rawPrefix === "drs") prefix = "Drs. ";
      else if (rawPrefix === "dra") prefix = "Dra. ";
      else if (rawPrefix === "ir") prefix = "Ir. ";
      else if (rawPrefix === "dr") prefix = "Dr. ";
      else if (rawPrefix === "prof") prefix = "Prof. ";
      mainName = mainName.substring(prefixMatch[0].length);
    }

    mainName = prefix + mainName.toUpperCase().trim();
    if (parts.length === 1) return mainName;

    const degreeParts = parts.slice(1).map((deg) => {
      const d = deg.trim();
      const lower = d.toLowerCase();
      if (lower === "s.pd" || lower === "s.pd.") return "S.Pd.";
      if (lower === "m.pd" || lower === "m.pd.") return "M.Pd.";
      if (lower === "m.si" || lower === "m.si.") return "M.Si.";
      if (lower === "s.si" || lower === "s.si.") return "S.Si.";
      if (lower === "s.kom" || lower === "s.kom.") return "S.Kom.";
      if (lower === "m.kom" || lower === "m.kom.") return "M.Kom.";
      if (lower === "s.e" || lower === "s.e.") return "S.E.";
      if (lower === "m.m" || lower === "m.m.") return "M.M.";
      if (lower === "s.h" || lower === "s.h.") return "S.H.";
      if (lower === "m.h" || lower === "m.h.") return "M.H.";
      if (lower === "s.t" || lower === "s.t.") return "S.T.";
      if (lower === "m.t" || lower === "m.t.") return "M.T.";
      if (lower === "s.sos" || lower === "s.sos.") return "S.Sos.";
      if (lower === "s.ip" || lower === "s.ip.") return "S.IP.";
      if (lower === "s.psi" || lower === "s.psi.") return "S.Psi.";
      if (lower === "s.ag" || lower === "s.ag.") return "S.Ag.";
      if (lower === "s.pd.i" || lower === "s.pd.i.") return "S.Pd.I.";
      if (lower === "m.pd.i" || lower === "m.pd.i.") return "M.Pd.I.";
      if (lower === "s.sn" || lower === "s.sn.") return "S.Sn.";
      if (lower === "m.sn" || lower === "m.sn.") return "M.Sn.";
      if (lower === "s.hut" || lower === "s.hut.") return "S.Hut.";
      if (lower === "s.p" || lower === "s.p.") return "S.P.";
      if (lower === "dr" || lower === "dr.") return "Dr.";
      if (lower === "drs" || lower === "drs.") return "Drs.";
      if (lower === "dra" || lower === "dra.") return "Dra.";
      if (lower === "ir" || lower === "ir.") return "Ir.";

      // Fallback: title case
      return d.replace(/\b[a-z]/g, (char) => char.toUpperCase());
    });

    return `${mainName}, ${degreeParts.join(", ")}`;
  };

  // Helper to format city name to Title Case (e.g. CIAMIS -> Ciamis, KABUPATEN CIAMIS -> Kabupaten Ciamis)
  const formatNamaKota = (zipStr: string) => {
    if (!zipStr) return "Ciamis";
    const cityPart = zipStr.split(/[–-]/)[0].trim();
    return cityPart
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Custom Jabar Logo SVG
  const JabarLogoSVG = () => (
    <svg
      className="w-20 h-24 print:w-16 print:h-20 shrink-0 select-none"
      viewBox="0 0 100 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Shield Shield with Green fill */}
      <path
        d="M50,10 C85,10 90,35 90,65 C90,95 50,115 50,115 C50,115 10,95 10,65 C10,35 15,10 50,10 Z"
        fill="#0b5e3a"
        stroke="#d4af37"
        strokeWidth="3"
      />
      {/* Inner design lines with gold colors and red stars */}
      <path
        d="M50,15 C78,15 82,38 82,65 C82,88 50,106 50,106 C50,106 18,88 18,65 C18,38 22,15 50,15 Z"
        fill="#137c4f"
        stroke="#eeca3a"
        strokeWidth="1.5"
      />

      {/* Central Tower / Gedung Sate simulation */}
      <rect x="46" y="35" width="8" height="40" fill="#ffffff" />
      <polygon
        points="42,35 50,22 58,35"
        fill="#ffd700"
        stroke="#b8860b"
        strokeWidth="1"
      />
      <line
        x1="50"
        y1="22"
        x2="50"
        y2="17"
        stroke="#ffffff"
        strokeWidth="2.5"
      />
      <circle cx="50" cy="16" r="2.5" fill="#f43f5e" /> {/* Top Red Star */}

      {/* Gold wings/ears simulation Jabar */}
      <path
        d="M28,60 C28,45 42,45 42,60 C42,75 28,75 28,60 Z M72,60 C72,45 58,45 58,60 C58,75 72,75 72,60 Z"
        fill="#ffd700"
        opacity="0.8"
      />

      {/* Ribbon with text Gemah Ripah */}
      <path
        d="M15,90 Q50,105 85,90"
        fill="none"
        stroke="#eeca3a"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M15,90 Q50,105 85,90"
        fill="none"
        stroke="#003366"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Text on ribbon */}
      <path id="ribbonTextPath" d="M18,91 Q50,106 82,91" fill="none" />
      <text
        fontFamily="Arial"
        fontSize="4.5"
        fontWeight="bold"
        fill="#ffffff"
        textAnchor="middle"
      >
        <textPath href="#ribbonTextPath" startOffset="50%">
          GEMAH RIPAH REPEH RAPIH
        </textPath>
      </text>
    </svg>
  );

  // Helper formatting numbers to Rupiah
  const formatRupiah = (num: number) => {
    return (
      "Rp. " +
      new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(num) +
      ",-"
    );
  };

  const formatFriendlyDate = (dateStr: string) => {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Check if PPPK based on grade
  const isPPPK = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
    "XIII",
    "XIV",
    "XV",
    "XVI",
    "XVII",
  ].includes(pegawai.pangkatGolongan);
  const useTTE = isPPPK
    ? settings.spesimen.useTTEForPPPK
    : settings.spesimen.useTTEForPNS;
  const regulasi = isPPPK ? settings.regulasiPPPK : settings.regulasiPNS;

  return (
    <div
      className="print-page font-sans w-full max-w-[215mm] mx-auto px-[10mm] pt-[16mm] pb-[14mm] select-text border print:border-none print:p-0 print:mx-0 print:max-w-none print:min-h-0 min-h-[330mm] flex flex-col justify-between"
      style={{
        boxSizing: "border-box",
        borderColor: "#f1f5f9",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        backgroundColor: "#ffffff",
        color: "#000000",
      }}
    >
      {/* Document Content Top and Body */}
      <div>
        {/* KOP SURAT / LETTERHEAD */}
        {settings.kop.useFullImage && settings.kop.fullImageUrl ? (
          <div className="w-full mb-3 select-none">
            <img
              src={settings.kop.fullImageUrl}
              alt="Kop Surat"
              referrerPolicy="no-referrer"
              className="w-full h-auto object-contain block"
            />
          </div>
        ) : (
          <div
            className="flex items-center space-x-4 pb-3 select-none"
            style={{ borderBottom: "4px solid #000000" }}
          >
            {settings.kop.logoUrl ? (
              <img
                src={settings.kop.logoUrl}
                alt="Logo Instansi"
                referrerPolicy="no-referrer"
                className="w-20 h-24 print:w-16 print:h-20 object-contain shrink-0"
              />
            ) : (
              JabarLogoSVG()
            )}

            <div className="flex-1 text-center font-sans">
              <h1
                className="text-[14pt] print:text-[12pt] font-extrabold tracking-normal leading-tight uppercase"
                style={{ color: "#000000" }}
              >
                {settings.kop.pemdaLine}
              </h1>
              <h2
                className="text-[13pt] print:text-[11pt] font-extrabold leading-snug uppercase"
                style={{ color: "#000000" }}
              >
                {settings.kop.dinasLine}
              </h2>
              <h3
                className="text-[13pt] print:text-[11pt] font-extrabold leading-snug uppercase tracking-tight"
                style={{ color: "#0066aa" }}
              >
                {settings.kop.cabdisLine}
              </h3>
              <p
                className="text-[9pt] print:text-[7.5pt] font-medium mt-1"
                style={{ color: "#000000" }}
              >
                {settings.kop.alamat}
              </p>
              <p
                className="text-[8.5pt] print:text-[7pt] font-normal italic"
                style={{ color: "#334155" }}
              >
                {settings.kop.kontak}
              </p>
              <p
                className="text-[9.5pt] print:text-[8pt] font-bold uppercase mt-0.5 tracking-wider"
                style={{ color: "#000000" }}
              >
                {settings.kop.kabupatenZip}
              </p>
            </div>
          </div>
        )}

        {/* INNER WRAPPER FOR DOCUMENT BODY ALIGNED WITH KOP */}
        <div className="px-0">
          {/* DATE & ADDRESSEE HEADER */}
        <div
          className="mt-3 grid grid-cols-2 text-[10pt] print:text-[8.8pt] leading-normal font-sans select-none"
          style={{ color: "#000000" }}
        >
          {/* Left Metadata Parameters */}
          <div className="space-y-1.5 flex flex-col justify-start">
            <div className="flex items-start">
              <span className="w-14 shrink-0 inline-block font-normal">
                Nomor
              </span>
              <span className="mr-1.5 font-normal">:</span>
              <span className="font-normal tracking-wide font-mono print:font-sans break-all">
                {nomorSurat}
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-14 shrink-0 inline-block font-normal">
                Sifat
              </span>
              <span className="mr-1.5 font-normal">:</span>
              <span className="font-normal">Biasa</span>
            </div>
            <div className="flex items-start">
              <span className="w-14 shrink-0 inline-block font-normal">
                Perihal
              </span>
              <span className="mr-1.5 font-normal">:</span>
              <span className="font-normal flex-1 leading-tight">
                Pemberitahuan Kenaikan Gaji<br />
                Berkala
              </span>
            </div>
          </div>

          {/* Right Destination / Date Block */}
          <div className="flex flex-col items-start pl-8 print:pl-4 space-y-1 text-left">
            <div className="mb-1 font-normal">
              {formatNamaKota(settings.kop.kabupatenZip)},{" "}
              {formatFriendlyDate(tanggalSurat)}
            </div>
            <div className="font-normal pl-[1.9rem]" style={{ color: "#000000" }}>
              Kepada
            </div>
            <div
              className="font-normal leading-tight"
              style={{ color: "#000000" }}
            >
              Yth. Sdr. Asisten Administrasi pada
            </div>
            <div
              className="pl-[2.2rem] leading-tight font-normal"
              style={{ color: "#0f172a" }}
            >
              Sekretariat Daerah Provinsi Jawa Barat
            </div>
            <div className="font-normal" style={{ color: "#000000" }}>
              di
            </div>
            <div
              className="pl-[2.2rem] font-normal uppercase tracking-[0.25em] text-[10pt] print:text-[8.8pt]"
              style={{ color: "#000000" }}
            >
              Bandung
            </div>
          </div>
        </div>

        {/* OPENING CLAUSE */}
        <div
          className="mt-3.5 text-[10pt] print:text-[8.8pt] text-justify leading-relaxed"
          style={{ color: "#000000" }}
        >
          <p>
            Dengan ini diberitahukan bahwa sehubungan telah dipenuhinya masa
            kerja dan syarat-syarat lainnya kepada :
          </p>
        </div>

        {/* LIST 1-6: PEGAWAI PROFILE DETAILS */}
        <div
          className="mt-2 pl-4 text-[10pt] print:text-[8.8pt] leading-relaxed space-y-0.5"
          style={{ color: "#000000" }}
        >
          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">1.</span>
            <span className="w-[235px] shrink-0 inline-block font-normal">
              Nama/Tempat dan tanggal lahir
            </span>
            <span className="mr-1.5 font-normal shrink-0">:</span>
            <span className="font-bold flex-1">
              {formatNamaDanGelar(pegawai.nama)} /{" "}
              {pegawai.tempatLahir.toUpperCase()},{" "}
              {formatFriendlyDate(pegawai.tanggalLahir).toUpperCase()}
            </span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">2.</span>
            <span className="w-[235px] shrink-0 inline-block font-normal">
              NIP
            </span>
            <span className="mr-1.5 font-normal shrink-0">:</span>
            <span className="font-normal font-mono print:font-sans tracking-wide flex-1">
              {pegawai.nip}
            </span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">3.</span>
            <span className="w-[235px] shrink-0 inline-block font-normal">
              Pangkat Golongan ruang
            </span>
            <span className="mr-1.5 font-normal shrink-0">:</span>
            <span className="font-normal uppercase flex-1">
              {pegawai.pangkatGolongan}
            </span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">4.</span>
            <span className="w-[235px] shrink-0 inline-block font-normal">
              Jabatan
            </span>
            <span className="mr-1.5 font-normal shrink-0">:</span>
            <span className="font-normal uppercase flex-1 leading-snug">
              {pegawai.jabatan}
            </span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">5.</span>
            <span className="w-[235px] shrink-0 inline-block font-normal">
              Unit Kerja
            </span>
            <span className="mr-1.5 font-normal shrink-0">:</span>
            <span className="font-normal uppercase flex-1 leading-snug">
              {pegawai.unitKerja}
            </span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">6.</span>
            <span className="w-[235px] shrink-0 inline-block font-normal">
              Gaji pokok (Rp.)
            </span>
            <span className="mr-1.5 font-normal shrink-0">:</span>
            <span className="font-normal flex-1">
              {formatRupiah(pegawai.gajiPokokLama)}
            </span>
          </div>
        </div>

        {/* ATAS DASAR SK SECTION */}
        <div
          className="mt-2.5 text-[10pt] print:text-[8.8pt] font-sans leading-relaxed text-justify"
          style={{ color: "#000000" }}
        >
          <p>atas dasar Surat Keputusan terakhir tentang gaji dan pangkat yang ditetapkan :</p>

          <div className="mt-1 pl-8 space-y-0.5">
            <div className="flex items-start">
              <span className="w-6 inline-block font-sans">a.</span>
              <span className="w-[220px] inline-block font-normal font-sans">
                Oleh Pejabat
              </span>
              <span className="mr-1.5 font-normal shrink-0">:</span>
              <span className="font-normal uppercase leading-tight">
                {pegawai.skOlehPejabat}
              </span>
            </div>

            <div className="flex items-start">
              <span className="w-6 inline-block font-sans">b.</span>
              <span className="w-[220px] inline-block font-normal font-sans">
                Tanggal dan Nomor
              </span>
              <span className="mr-1.5 font-normal shrink-0">:</span>
              <span className="font-normal uppercase">
                {formatFriendlyDate(pegawai.skTanggal).toUpperCase()}, NO.{" "}
                {pegawai.skNomor.toUpperCase()}
              </span>
            </div>

            <div className="flex items-start">
              <span className="w-6 inline-block font-sans">c.</span>
              <span className="w-[220px] inline-block font-normal font-sans">
                Tanggal mulai berlaku gaji
              </span>
              <span className="mr-1.5 font-normal shrink-0">:</span>
              <span className="font-normal uppercase">
                {formatFriendlyDate(pegawai.skTglMulaiBerlaku).toUpperCase()}
              </span>
            </div>

            <div className="flex items-start">
              <span className="w-6 inline-block font-sans">d.</span>
              <span className="w-[220px] inline-block font-normal font-sans">
                Masa kerja pada tanggal tersebut
              </span>
              <span className="mr-1.5 font-normal shrink-0">:</span>
              <span className="font-normal">
                {pegawai.skMasaKerjaTahun} tahun{" "}
                {pegawai.skMasaKerjaBulan} bulan
              </span>
            </div>
          </div>
        </div>

        {/* SECTION: DIBERIKAN KENAIKAN GAJI BERKALA SEHINGGA MEMPEROLEH */}
        <div className="mt-2.5 py-1 text-center">
          <h4
            className="text-[10.5pt] print:text-[9.5pt] font-extrabold tracking-wide uppercase"
            style={{ color: "#000000" }}
          >
            DIBERIKAN KENAIKAN GAJI BERKALA SEHINGGA MEMPEROLEH :
          </h4>
        </div>

        {/* LIST 7-11: NEW SALARY BENEFIT DETAILS */}
        <div
          className="mt-2 pl-4 text-[10pt] print:text-[8.8pt] leading-relaxed space-y-0.5"
          style={{ color: "#000000" }}
        >
          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">7.</span>
            <span className="w-[235px] shrink-0 inline-block font-normal">
              Gaji pokok baru (Rp.)
            </span>
            <span className="mr-1.5 font-normal shrink-0">:</span>
            <span className="font-bold flex-1">
              {formatRupiah(pegawai.gajiPokokBaru)}
            </span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">8.</span>
            <span className="w-[235px] shrink-0 inline-block font-normal">
              Berdasarkan masa kerja golongan
            </span>
            <span className="mr-1.5 font-normal shrink-0">:</span>
            <span className="font-normal flex-1">
              {pegawai.mkTahunBaru} tahun {pegawai.mkBulanBaru} bulan
            </span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">9.</span>
            <span className="w-[235px] shrink-0 inline-block font-normal">
              Dalam Pangkat / Golongan ruang
            </span>
            <span className="mr-1.5 font-normal shrink-0">:</span>
            <span className="font-normal uppercase flex-1">
              {pegawai.pangkatGolonganBaru || pegawai.pangkatGolongan}
            </span>
          </div>

          {pegawai.jabatanBaru && pegawai.jabatanBaru !== pegawai.jabatan && (
            <div className="flex items-start">
              <span className="w-6 shrink-0 inline-block"></span>
              <span className="w-[235px] shrink-0 inline-block font-normal pl-6">
                Dalam Jabatan baru
              </span>
              <span className="mr-1.5 font-normal shrink-0">:</span>
              <span className="font-normal uppercase flex-1">
                {pegawai.jabatanBaru}
              </span>
            </div>
          )}

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">10.</span>
            <span className="w-[235px] shrink-0 inline-block font-normal">
              Terhitung mulai tanggal
            </span>
            <span className="mr-1.5 font-normal shrink-0">:</span>
            <span className="font-bold flex-1">
              {formatFriendlyDate(pegawai.tmtBaru).toUpperCase()}
            </span>
          </div>

          <div className="flex items-start">
            <span className="w-6 shrink-0 inline-block">11.</span>
            <span className="w-[235px] shrink-0 inline-block font-normal">
              Kenaikan yang akan datang bila
              <br />
              <span className="pl-0">Memenuhi syarat</span>
            </span>
            <span className="mr-1.5 font-normal shrink-0">:</span>
            <span className="font-normal flex-1">
              {formatFriendlyDate(pegawai.tmtAkanDatang).toUpperCase()}
            </span>
          </div>
        </div>

        {/* LEGISLATION INSTRUCTION FOOTER */}
        <div
          className="mt-2.5 text-[10pt] print:text-[8.8pt] text-justify leading-relaxed font-sans first-letter:uppercase"
          style={{ color: "#000000" }}
        >
          <p>
            Diharapkan kepada Pegawai tersebut dibayarkan penghasilan gaji pokok
            baru sesuai dengan{" "}
            <span className="underline font-normal">{regulasi}</span>.
          </p>
        </div>
        </div>
      </div>

      {/* FOOTER SECTION: SIGNATURE & COPIES (TEMBUSAN) - Placed at the very bottom */}
      <div
        className="mt-4 pt-2 flex flex-col space-y-4 text-[10pt] print:text-[8.8pt] leading-normal font-sans px-0"
        style={{ color: "#000000" }}
      >
        {/* Signature Block (on the right) */}
        <div className="flex justify-end w-full">
          <div className="w-[360px] print:w-[350px] flex flex-col items-center justify-start text-center pl-1 select-none">
            <span
              className="block font-bold uppercase text-center w-full text-[10pt] print:text-[8.8pt]"
              style={{ color: "#000000" }}
            >
              {settings.spesimen.jabatanLengkap},
            </span>

            {/* DIGITAL SIGNATURE / TTE BLOCK */}
            {useTTE ? (
              <div
                className="my-1 py-1.5 px-4 flex items-center space-x-3.5 text-left w-full select-none min-h-[72px] print:min-h-[68px]"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #000000",
                  borderRadius: "14px",
                }}
              >
                {/* Custom Seal Indicator */}
                <div className="w-[48px] h-[48px] bg-white shrink-0 flex items-center justify-center overflow-hidden">
                  {settings.spesimen.tteLogoType &&
                  settings.spesimen.tteLogoType !== "bawaan" &&
                  settings.spesimen.customTteLogoUrl ? (
                    <img
                      src={settings.spesimen.customTteLogoUrl}
                      alt="TTE Segel"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    /* High-fidelity SVG of the BSrE/Jabar style digital signature seal */
                    <svg
                      viewBox="0 0 100 100"
                      className="w-[46px] h-[46px]"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Top dots */}
                      <circle cx="50" cy="15" r="3" fill="#0ea5e9" />
                      <circle cx="50" cy="23" r="3" fill="#0ea5e9" />
                      <circle cx="50" cy="31" r="3" fill="#0ea5e9" />

                      {/* Left and right brackets/capsules resembling fingerprint */}
                      <path
                        d="M40,35 H60"
                        stroke="#0ea5e9"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M30,42 H70"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Fingerprint ridges */}
                      <path
                        d="M42,50 C42,46 58,46 58,50 C58,62 46,62 46,72"
                        stroke="#f59e0b"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M36,50 C36,41 64,41 64,50 C64,68 52,68 52,78 M52,84"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M30,50 C30,36 70,36 70,50 C70,74 58,74 58,84"
                        stroke="#0ea5e9"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                      />

                      {/* Verification badge/shield decor */}
                      <circle cx="36" cy="56" r="2.5" fill="#0ea5e9" />
                      <circle cx="64" cy="56" r="2.5" fill="#10b981" />
                    </svg>
                  )}
                </div>
                <div className="text-[7.2pt] print:text-[6.6pt] leading-tight font-sans flex-1 overflow-hidden pr-1">
                  <span
                    className="block italic leading-tight mb-0.5 whitespace-pre-wrap"
                    style={{ color: "#475569" }}
                  >
                    {settings.spesimen.tteHeader ||
                      "Ditandatangani secara elektronik oleh:"}
                  </span>
                  <span
                    className="block font-bold uppercase leading-tight tracking-wide mb-0.5 text-[7.2pt] print:text-[6.6pt] break-words"
                    style={{ color: "#000000" }}
                  >
                    {settings.spesimen.jabatanLengkap}
                  </span>
                  {/* Space between Office Title and Official Name */}
                  <div className="h-[10px] print:h-[8px]" />
                  <span
                    className="block font-bold leading-tight text-[8.2pt] print:text-[7.6pt] break-words"
                    style={{ color: "#000000" }}
                  >
                    {formatNamaDanGelar(settings.spesimen.namaPejabat)}
                  </span>
                  <span
                    className="block font-medium font-sans break-words mt-0.5 text-[7.2pt] print:text-[6.6pt]"
                    style={{ color: "#475569" }}
                  >
                    {settings.spesimen.pangkatPangkat}
                    {!isPPPK &&
                      settings.spesimen.golonganRuang &&
                      `/${settings.spesimen.golonganRuang}`}
                  </span>
                </div>
              </div>
            ) : (
              /* MANUAL SIGNATURE SPACE IN PNS - COMPLETELY BLANK FOR WET SIGNATURE & PHYSICAL STAMP */
              <div className="h-16 print:h-12 w-full" />
            )}

            {/* CHIEF IDENTIFICATION BLOCK (Only visible if not using TTE) */}
            {!useTTE && (
              <div className="w-full text-center" style={{ color: "#000000" }}>
                <span
                  className="block font-extrabold underline text-[10pt] print:text-[8.8pt] break-words"
                  style={{ color: "#000000" }}
                >
                  {formatNamaDanGelar(settings.spesimen.namaPejabat)}
                </span>
                <span
                  className="block text-[9pt] print:text-[8pt] font-semibold uppercase mt-0.5 break-words"
                  style={{ color: "#000000" }}
                >
                  {settings.spesimen.pangkatPangkat}
                  {!isPPPK &&
                    settings.spesimen.golonganRuang &&
                    `, ${settings.spesimen.golonganRuang}`}
                </span>
                <span
                  className="block font-mono print:font-sans text-[8.5pt] print:text-[7.8pt] mt-0.5 font-semibold"
                  style={{ color: "#000000" }}
                >
                  NIP. {settings.spesimen.nip}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tembusan section moved below signature dynamically, aligned bottom-left */}
        <div className="w-full text-left space-y-2.5 pt-1" style={{ color: "#000000" }}>
          <span
            className="block font-bold uppercase tracking-wider text-[7.5pt] print:text-[7pt]"
            style={{ color: "#000000" }}
          >
            Tembusan : disampaikan kepada Yth :
          </span>
          <ol className="list-decimal list-inside pl-1 space-y-0.5 text-[7.5pt] print:text-[6.8pt] font-normal">
            {tembusanList.map((item, id) => (
              <li
                key={id}
                className="leading-normal text-left break-words whitespace-normal max-w-xl"
                style={{ color: "#000000" }}
              >
                {item}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}