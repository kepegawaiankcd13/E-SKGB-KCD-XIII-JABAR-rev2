/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pegawai, SystemSettings, ActivityLog, StaffUser } from "../types";

export const initialPegawaiList: Pegawai[] = [];

export const initialSystemSettings: SystemSettings = {
  kop: {
    pemdaLine: "PEMERINTAH DAERAH PROVINSI JAWA BARAT",
    dinasLine: "DINAS PENDIDIKAN",
    cabdisLine: "CABANG DINAS PENDIDIKAN WILAYAH XIII",
    alamat: "Jalan Jenderal Ahmad Yani Nomor 101 Kecamatan Ciamis",
    kontak: "e-mail: cabdisdik13@jabarprov.go.id / kcdwilxiii@gmail.com",
    kabupatenZip: "CIAMIS – 46213"
  },
  spesimen: {
    namaPejabat: "DWI YANTI ESTRININGRUM, S.Sos., M.Pd.",
    pangkatPangkat: "Pembina Tk. I",
    golonganRuang: "IV/b",
    nip: "197202022005012011",
    jabatanLengkap: "KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII",
    useTTEForPPPK: true,
    useTTEForPNS: false,
    tteSecuredText: "Ditandatangani secara elektronik oleh: KEPALA CABANG DINAS PENDIDIKAN WILAYAH XIII PROVINSI JAWA BARAT, DWI YANTI ESTRININGRUM, S.Sos., M.Pd. Pembina Tk. I"
  },
  nomorSuratCounter: "7469/KPG.14/KCD XIII",
  regulasiPNS: "Peraturan Presiden Nomor 05 Tahun 2024",
  regulasiPPPK: "Peraturan Pemerintah Nomor 11 Tahun 2024"
};

export const initialActivityLogs: ActivityLog[] = [
  {
    id: "log-1",
    timestamp: "2026-06-15T09:00:00Z",
    adminUser: "Super Admin",
    action: "Inisialisasi Sistem",
    detail: "Sistem SKGB diaktifkan pertama kali dengan data awal Cabdisdik XIII Jabar."
  },
  {
    id: "log-2",
    timestamp: "2026-06-15T10:15:30Z",
    adminUser: "Super Admin",
    action: "Ubah Pengaturan",
    detail: "Mengonfigurasi spesimen tanda tangan dan kop surat wilayah Kerja Ciamis."
  },
  {
    id: "log-3",
    timestamp: "2026-06-16T11:02:11Z",
    adminUser: "Super Admin",
    action: "Cetak SKGB",
    detail: "Mencetak SKGB PPPK untuk pegawai WIKA NAJMUDIN, S.Pd."
  }
];

export const initialStaffUserList: StaffUser[] = [
  {
    id: "staff-1",
    username: "admin",
    password: "jabar123",
    name: "Asep Sunandar (Super Admin)",
    role: "Administrasi KCD Wilayah XIII",
    createdAt: "2026-06-15T09:00:00Z",
    status: "Aktif"
  },
  {
    id: "staff-2",
    username: "stafkepeg1",
    password: "staf123",
    name: "Hj. Nina Karlina, S.IP.",
    role: "Staf Kepegawaian",
    createdAt: "2026-06-16T14:22:15Z",
    status: "Aktif"
  },
  {
    id: "staff-3",
    username: "stafkepeg2",
    password: "staf456",
    name: "Yudi Wahyudi, S.ST.",
    role: "Staf Kepegawaian",
    createdAt: "2026-06-17T08:12:00Z",
    status: "Aktif"
  }
];

