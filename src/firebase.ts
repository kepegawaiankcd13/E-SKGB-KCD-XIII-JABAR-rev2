import { Pegawai, SystemSettings, ActivityLog, StaffUser } from "./types";

// -------------------------------------------------------------
// MONGODB-BACKED API SYNC HELPERS (replacing Firebase transparently)
// -------------------------------------------------------------

// Helper to check for specific whitelisting connection blocks from Atlas
function checkWhitelistError(json: any) {
  if (json && json.error) {
    if (json.error.includes("KONEKSI_DIBLOKIR_IP_WHITELIST")) {
      throw new Error(json.error);
    }
    if (json.error.includes("MONGODB_URI") || json.error.includes("missing MONGODB_URI") || json.error.includes("Missing MONGODB_URI")) {
      throw new Error("MONGODB_URI_MISSING: Variabel `MONGODB_URI` belum diatur di menu Settings -> Secrets pada dasbor Google AI Studio. Silakan masukkan connection string MongoDB Atlas Anda agar database cloud dapat sinkron secara realtime.");
    }
  }
}

// Resilient JSON response parser helper to handle potential HTML error pages gracefully
async function handleResponseJson(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    if (text.trim().startsWith("<!doctype") || text.trim().startsWith("<html")) {
      throw new Error("Koneksi server gagal atau sedang memproses ulang. Silakan segarkan halaman (refresh) dalam beberapa saat.");
    }
    throw new Error(text || "Format respon server tidak valid.");
  }
  return res.json();
}

// 1. Pegawai (Employees) Data Sync
export async function getPegawaiFromFirestore(): Promise<Pegawai[] | null> {
  try {
    const res = await fetch("/api/pegawai");
    const json = await handleResponseJson(res);
    checkWhitelistError(json);
    if (json.success) {
      return json.data && json.data.length > 0 ? json.data : null;
    }
    throw new Error(json.error || "Failed to fetch pegawai");
  } catch (error: any) {
    console.error("Error reading pegawai from MongoDB via API:", error);
    if (error.message && (error.message.includes("KONEKSI_DIBLOKIR_IP_WHITELIST") || error.message.includes("MONGODB_URI_MISSING"))) {
      throw error;
    }
    return null;
  }
}

export async function savePegawaiToFirestore(pegawai: Pegawai): Promise<boolean> {
  try {
    const res = await fetch("/api/pegawai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pegawai),
    });
    const json = await handleResponseJson(res);
    return !!json.success;
  } catch (error) {
    console.error("Error saving pegawai to MongoDB via API:", error);
    return false;
  }
}

export async function deletePegawaiFromFirestore(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/pegawai/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const json = await handleResponseJson(res);
    return !!json.success;
  } catch (error) {
    console.error("Error deleting pegawai from MongoDB via API:", error);
    return false;
  }
}

export async function clearAllPegawaiFromFirestore(): Promise<boolean> {
  try {
    const res = await fetch("/api/pegawai", {
      method: "DELETE",
    });
    const json = await handleResponseJson(res);
    return !!json.success;
  } catch (error) {
    console.error("Error clearing all pegawai from MongoDB via API:", error);
    return false;
  }
}

// 2. Settings Sync
export async function getSettingsFromFirestore(): Promise<SystemSettings | null> {
  try {
    const res = await fetch("/api/settings");
    const json = await handleResponseJson(res);
    checkWhitelistError(json);
    if (json.success && json.data) {
      return json.data as SystemSettings;
    }
    return null;
  } catch (error: any) {
    console.error("Error loading settings from MongoDB via API:", error);
    if (error.message && (error.message.includes("KONEKSI_DIBLOKIR_IP_WHITELIST") || error.message.includes("MONGODB_URI_MISSING"))) {
      throw error;
    }
    return null;
  }
}

export async function saveSettingsToFirestore(settings: SystemSettings): Promise<boolean> {
  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const json = await handleResponseJson(res);
    return !!json.success;
  } catch (error) {
    console.error("Error saving settings to MongoDB via API:", error);
    return false;
  }
}

// 3. Activity Logs Sync
export async function getLogsFromFirestore(): Promise<ActivityLog[] | null> {
  try {
    const res = await fetch("/api/activity_logs");
    const json = await handleResponseJson(res);
    checkWhitelistError(json);
    if (json.success) {
      return json.data;
    }
    return null;
  } catch (error: any) {
    console.error("Error loading activity logs from MongoDB via API:", error);
    if (error.message && (error.message.includes("KONEKSI_DIBLOKIR_IP_WHITELIST") || error.message.includes("MONGODB_URI_MISSING"))) {
      throw error;
    }
    return null;
  }
}

export async function saveLogToFirestore(log: ActivityLog): Promise<boolean> {
  try {
    const res = await fetch("/api/activity_logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    });
    const json = await handleResponseJson(res);
    return !!json.success;
  } catch (error) {
    console.error("Error saving log to MongoDB via API:", error);
    return false;
  }
}

// 4. Staff Accounts Sync
export async function getStaffFromFirestore(): Promise<StaffUser[] | null> {
  try {
    const res = await fetch("/api/staff_users");
    const json = await handleResponseJson(res);
    checkWhitelistError(json);
    if (json.success) {
      return json.data && json.data.length > 0 ? json.data : null;
    }
    return null;
  } catch (error: any) {
    console.error("Error loading staff from MongoDB via API:", error);
    if (error.message && (error.message.includes("KONEKSI_DIBLOKIR_IP_WHITELIST") || error.message.includes("MONGODB_URI_MISSING"))) {
      throw error;
    }
    return null;
  }
}

export async function saveStaffToFirestore(staff: StaffUser): Promise<boolean> {
  try {
    const res = await fetch("/api/staff_users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(staff),
    });
    const json = await handleResponseJson(res);
    return !!json.success;
  } catch (error) {
    console.error("Error saving staff to MongoDB via API:", error);
    return false;
  }
}

export async function deleteStaffFromFirestore(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/staff_users/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const json = await handleResponseJson(res);
    return !!json.success;
  } catch (error) {
    console.error("Error deleting staff from MongoDB via API:", error);
    return false;
  }
}
