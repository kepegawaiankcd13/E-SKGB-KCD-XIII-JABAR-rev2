/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum KepegawaianType {
  PNS = "PNS",
  PPPK = "PPPK"
}

export interface Pegawai {
  id: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  nip: string;
  pangkatGolongan: string; // e.g. "IX" for PPPK or "PENATA Tk. I, III/d" for PNS
  jabatan: string; // e.g. "GURU AHLI PERTAMA - PPKN"
  unitKerja: string; // e.g. "SMKN CIMERAK KABUPATEN PANGANDARAN"
  gajiPokokLama: number; // e.g. 3203600
  noHp?: string; // for notifications
  email?: string; // for notifications
  
  // SK Terakhir (Lama)
  skOlehPejabat: string;
  skNomor: string;
  skTanggal: string; // YYYY-MM-DD
  skTglMulaiBerlaku: string; // YYYY-MM-DD
  skMasaKerjaTahun: number;
  skMasaKerjaBulan: number;
  
  // Penambahan Masa Kerja (PMK)
  hasPMK: boolean;
  pmkTahun?: number;
  pmkBulan?: number;
  pmkNomor?: string;
  pmkTanggal?: string;

  // Data Kenaikan Gaji Berkala (Baru)
  pangkatGolonganBaru?: string;
  jabatanBaru?: string;
  gajiPokokBaru: number; // e.g. 3304400
  mkTahunBaru: number;
  mkBulanBaru: number;
  tmtBaru: string; // YYYY-MM-DD
  tmtAkanDatang: string; // YYYY-MM-DD
  noSuratBaru?: string; // Optional new document/letter number for KGB
  tglSuratBaru?: string; // Optional new document/letter date for KGB (YYYY-MM-DD)
  
  statusKGB: "Selesai" | "Perlu Diproses" | "Mendekati Jatuh Tempo" | "Belum Selesai";
  kgbFileUrl?: string; // base64 pdf/image of finalized signed KGB document
  kgbFileName?: string; // name of the file
  kgbUploadedAt?: string; // ISO date of upload
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string
  adminUser: string;
  action: string; // e.g., "Menambah Pegawai", "Mencetak SKGB", "Mengubah KOP Surat"
  detail: string;
}

export interface KopLetterhead {
  pemdaLine: string; // e.g. "PEMERINTAH DAERAH PROVINSI JAWA BARAT"
  dinasLine: string; // e.g. "DINAS PENDIDIKAN"
  cabdisLine: string; // e.g. "CABANG DINAS PENDIDIKAN WILAYAH XIII"
  alamat: string; // e.g. "Jalan Jenderal Ahmad Yani Nomor 101 Kecamatan Ciamis"
  kontak: string; // e.g. "e-mail: cabdisdik13@jabarprov.go.id / kcdwilxiii@gmail.com"
  kabupatenZip: string; // e.g. "CIAMIS - 46213"
  logoUrl?: string; // base64 or custom selection
  useFullImage?: boolean; // set to true to bypass text lines and show full image KOP
  fullImageUrl?: string; // base64 or custom URL for full KOP letterhead
}

export interface SpesimenTtd {
  namaPejabat: string; // DWI YANTI ESTRININGRUM, S.Sos., M.Pd.
  pangkatPangkat: string; // Pembina Tk. I
  golonganRuang?: string; // IV/b (for manual)
  nip: string; // 197202022005012011
  jabatanLengkap: string; // KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII
  
  // TTE vs Manual Settings
  useTTEForPPPK: boolean;
  useTTEForPNS: boolean;
  tteSecuredText: string; // "Ditandatangani secara elektronik oleh: ..."
  manualStampUrl?: string; // base64/placeholder
  manualSignatureUrl?: string; // base64/placeholder
  tteLogoType?: "bawaan" | "url" | "upload";
  tteHeader?: string;
  customTteLogoUrl?: string;
}

export interface SystemSettings {
  kop: KopLetterhead;
  spesimen: SpesimenTtd;
  nomorSuratCounter: string; // e.g., "[nomor_agenda]/KPG.14/KCD XIII"
  regulasiPNS: string; // e.g. "Peraturan Presiden Nomor 05 Tahun 2024"
  regulasiPPPK: string; // e.g. "Peraturan Pemerintah Nomor 11 Tahun 2024"
}

export interface StaffUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: string;
  createdAt?: string;
  status: "Aktif" | "Nonaktif";
}
