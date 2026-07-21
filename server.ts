import express from "express";
import path from "path";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with size limits for larger Excel imports
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// MongoDB Connection helper
let mongoClient: MongoClient | null = null;
const DB_NAME = "kepeg13_db";

async function getDb() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }
  
  // Clean potential outer quotes and whitespaces
  uri = uri.trim().replace(/^["']|["']$/g, "").trim();

  if (!mongoClient) {
    const tempClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast if IP is blocked
    });
    try {
      await tempClient.connect();
      mongoClient = tempClient;
      console.log("MongoDB Atlas connected successfully to DB:", DB_NAME);
    } catch (err: any) {
      console.error("Failed to connect to MongoDB Atlas:", err);
      mongoClient = null; // Reset to allow retry on next API request
      
      const errMsg = err?.message || "";
      if (errMsg.includes("tlsv1 alert internal error") || errMsg.includes("SSL alert") || errMsg.includes("ssl3_read_bytes")) {
        throw new Error("KONEKSI_DIBLOKIR_IP_WHITELIST: IP server hosting saat ini belum di-whitelist di dasbor MongoDB Atlas Anda. Silakan buka akun MongoDB Atlas -> klik 'Network Access' -> klik 'Add IP Address' -> pilih 'Allow Access From Anywhere' (0.0.0.0/0) -> klik 'Confirm' dan tunggu 1 menit.");
      }
      throw err;
    }
  }
  return mongoClient.db(DB_NAME);
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// 1. Pegawai (Employees) API
app.get("/api/pegawai", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection<any>("pegawai");
    const list = await collection.find({}).toArray();
    
    // Map _id or internal fields to ID for client safety
    const mapped = list.map((doc) => ({
      ...doc,
      id: doc.id || doc._id.toString(),
    }));
    res.json({ success: true, data: mapped });
  } catch (error: any) {
    console.error("Error GET /api/pegawai:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/pegawai", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection<any>("pegawai");
    const pegawai = req.body;
    
    if (!pegawai.id) {
      return res.status(400).json({ success: false, error: "Pegawai ID is required." });
    }

    // Save with custom _id matching pegawai.id
    const docToSave = { ...pegawai, _id: pegawai.id };
    
    await collection.replaceOne({ _id: pegawai.id }, docToSave, { upsert: true });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error POST /api/pegawai:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/pegawai/:id", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection<any>("pegawai");
    const { id } = req.params;
    await collection.deleteOne({ _id: id });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error DELETE /api/pegawai/:id:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/pegawai", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection<any>("pegawai");
    await collection.deleteMany({});
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error DELETE /api/pegawai (clear all):", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Settings API
app.get("/api/settings", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection<any>("settings");
    const settingsDoc = await collection.findOne({ _id: "global" });
    if (settingsDoc) {
      res.json({ success: true, data: settingsDoc });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error: any) {
    console.error("Error GET /api/settings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection<any>("settings");
    const settings = req.body;
    await collection.replaceOne({ _id: "global" }, { ...settings, _id: "global" }, { upsert: true });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error POST /api/settings:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Activity Logs API
app.get("/api/activity_logs", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection<any>("activity_logs");
    // Get logs, sort descending by timestamp
    const logs = await collection.find({}).sort({ timestamp: -1 }).toArray();
    const mapped = logs.map(doc => ({
      ...doc,
      id: doc.id || doc._id.toString(),
    }));
    res.json({ success: true, data: mapped });
  } catch (error: any) {
    console.error("Error GET /api/activity_logs:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/activity_logs", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection<any>("activity_logs");
    const log = req.body;
    
    if (!log.id) {
      return res.status(400).json({ success: false, error: "Log ID is required." });
    }

    const docToSave = { ...log, _id: log.id };
    await collection.replaceOne({ _id: log.id }, docToSave, { upsert: true });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error POST /api/activity_logs:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Staff Accounts API
app.get("/api/staff_users", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection<any>("staff_users");
    const list = await collection.find({}).toArray();
    const mapped = list.map((doc) => ({
      ...doc,
      id: doc.id || doc._id.toString(),
    }));
    res.json({ success: true, data: mapped });
  } catch (error: any) {
    console.error("Error GET /api/staff_users:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/staff_users", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection<any>("staff_users");
    const staff = req.body;
    
    if (!staff.id) {
      return res.status(400).json({ success: false, error: "Staff ID is required." });
    }

    const docToSave = { ...staff, _id: staff.id };
    await collection.replaceOne({ _id: staff.id }, docToSave, { upsert: true });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error POST /api/staff_users:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/staff_users/:id", async (req, res) => {
  try {
    const db = await getDb();
    const collection = db.collection<any>("staff_users");
    const { id } = req.params;
    await collection.deleteOne({ _id: id });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error DELETE /api/staff_users/:id:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Firebase to MongoDB Atlas Migration Endpoint
app.post("/api/migrate-from-firebase", async (req, res) => {
  try {
    const fs = await import("fs");
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      return res.status(404).json({ success: false, error: "Berkas konfigurasi Firebase (firebase-applet-config.json) tidak ditemukan." });
    }
    
    const configRaw = fs.readFileSync(configPath, "utf-8");
    const firebaseConfig = JSON.parse(configRaw);
    
    const projectId = firebaseConfig.projectId;
    const databaseId = firebaseConfig.firestoreDatabaseId || "(default)";
    const apiKey = firebaseConfig.apiKey;
    
    if (!projectId || !apiKey) {
      return res.status(400).json({ success: false, error: "Konfigurasi Firebase tidak lengkap (missing projectId or apiKey)." });
    }

    const collections = ["pegawai", "settings", "activity_logs", "staff_users"];
    const db = await getDb();
    const stats: any = {};

    function parseFirestoreValue(val: any): any {
      if (!val) return null;
      if ('stringValue' in val) return val.stringValue;
      if ('integerValue' in val) return parseInt(val.integerValue, 10);
      if ('doubleValue' in val) return parseFloat(val.doubleValue);
      if ('booleanValue' in val) return val.booleanValue;
      if ('mapValue' in val) {
        const obj: any = {};
        const fields = val.mapValue.fields || {};
        for (const key of Object.keys(fields)) {
          obj[key] = parseFirestoreValue(fields[key]);
        }
        return obj;
      }
      if ('arrayValue' in val) {
        const arr = val.arrayValue.values || [];
        return arr.map((item: any) => parseFirestoreValue(item));
      }
      if ('nullValue' in val) return null;
      return null;
    }

    function parseFirestoreDoc(doc: any): any {
      const fields = doc.fields || {};
      const obj: any = {};
      for (const key of Object.keys(fields)) {
        obj[key] = parseFirestoreValue(fields[key]);
      }
      if (!obj.id && doc.name) {
        const parts = doc.name.split('/');
        obj.id = parts[parts.length - 1];
      }
      return obj;
    }

    for (const col of collections) {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${col}?pageSize=5000&key=${apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Gagal mengambil data koleksi ${col} dari Firebase REST API:`, response.statusText);
        stats[col] = 0;
        continue;
      }

      const json: any = await response.json();
      const documents = json.documents || [];
      
      let migratedCount = 0;
      const mongoCol = db.collection<any>(col);

      for (const doc of documents) {
        const parsed = parseFirestoreDoc(doc);
        if (parsed.id) {
          const docToSave = { ...parsed, _id: parsed.id };
          await mongoCol.replaceOne({ _id: parsed.id }, docToSave, { upsert: true });
          migratedCount++;
        }
      }
      
      stats[col] = migratedCount;
    }

    res.json({ success: true, stats });
  } catch (error: any) {
    console.error("Error migrating from Firebase:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC FILE SERVING FOR PRODUCTION
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
