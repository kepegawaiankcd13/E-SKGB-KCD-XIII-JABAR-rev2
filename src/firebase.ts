import { Pegawai, SystemSettings, ActivityLog, StaffUser } from "./types";

// -------------------------------------------------------------
// MONGODB-BACKED API SYNC HELPERS (replacing Firebase transparently)
// -------------------------------------------------------------

// Helper to check for specific whitelisting connection blocks from Atlas
function checkWhitelistError(json: any) {
  if (json && json.error && json.error.includes("KONEKSI_DIBLOKIR_IP_WHITELIST")) {
    throw new Error(json.error);
  }
}

// 1. Pegawai (Employees) Data Sync
export async function getPegawaiFromFirestore(): Promise<Pegawai[] | null> {
  try {
    const res = await fetch("/api/pegawai");
    const json = await res.json();
    checkWhitelistError(json);
    if (json.success) {
      return json.data && json.data.length > 0 ? json.data : null;
    }
    throw new Error(json.error || "Failed to fetch pegawai");
  } catch (error: any) {
    console.error("Error reading pegawai from MongoDB via API:", error);
    if (error.message && error.message.includes("KONEKSI_DIBLOKIR_IP_WHITELIST")) {
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
    const json = await res.json();
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
    const json = await res.json();
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
    const json = await res.json();
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
    const json = await res.json();
    checkWhitelistError(json);
    if (json.success && json.data) {
      return json.data as SystemSettings;
    }
    return null;
  } catch (error: any) {
    console.error("Error loading settings from MongoDB via API:", error);
    if (error.message && error.message.includes("KONEKSI_DIBLOKIR_IP_WHITELIST")) {
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
    const json = await res.json();
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
    const json = await res.json();
    checkWhitelistError(json);
    if (json.success) {
      return json.data;
    }
    return null;
  } catch (error: any) {
    console.error("Error loading activity logs from MongoDB via API:", error);
    if (error.message && error.message.includes("KONEKSI_DIBLOKIR_IP_WHITELIST")) {
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
    const json = await res.json();
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
    const json = await res.json();
    checkWhitelistError(json);
    if (json.success) {
      return json.data && json.data.length > 0 ? json.data : null;
    }
    return null;
  } catch (error: any) {
    console.error("Error loading staff from MongoDB via API:", error);
    if (error.message && error.message.includes("KONEKSI_DIBLOKIR_IP_WHITELIST")) {
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
    const json = await res.json();
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
    const json = await res.json();
    return !!json.success;
  } catch (error) {
    console.error("Error deleting staff from MongoDB via API:", error);
    return false;
  }
}
