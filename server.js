import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables from .env if present
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware for parsing JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper: Get active database configuration
function getDbConfig(custom = null) {
  return {
    host: custom?.dbHost || process.env.DB_HOST || 'localhost',
    port: Number(custom?.dbPort || process.env.DB_PORT || 3306),
    user: custom?.dbUser || process.env.DB_USER || '',
    password: custom?.dbPassword || process.env.DB_PASSWORD || '',
    database: custom?.dbName || process.env.DB_NAME || '',
  };
}

// Core Database Migration Engine
async function runDatabaseMigration(customConfig = null) {
  const cfg = getDbConfig(customConfig);

  if (!cfg.database || !cfg.user) {
    throw new Error('Database name or database user is missing in environment variables or request body.');
  }

  const schemaPath = path.join(__dirname, 'hostinger-mysql-schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at ${schemaPath}`);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Connect to Hostinger MySQL instance
  const connection = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    multipleStatements: true,
    connectTimeout: 15000,
  });

  try {
    console.log(`[Database] Starting SQL schema migration on ${cfg.database}@${cfg.host}:${cfg.port}...`);
    await connection.query(schemaSql);

    // Fetch list of created tables
    const [rows] = await connection.query('SHOW TABLES');
    const tables = rows.map((r) => Object.values(r)[0]);

    console.log(`[Database] Migration completed! ${tables.length} tables verified in ${cfg.database}.`);
    return {
      success: true,
      database: cfg.database,
      tableCount: tables.length,
      tables,
    };
  } finally {
    await connection.end();
  }
}

// Auto-run migration if database credentials exist but tables don't
async function autoMigrateOnStartup() {
  const cfg = getDbConfig();
  if (!cfg.database || !cfg.user) {
    console.log('[Database] Database credentials not yet configured. Skipping auto-migration.');
    return;
  }

  try {
    const connection = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      connectTimeout: 8000,
    });

    const [rows] = await connection.query("SHOW TABLES LIKE 'tenants'");
    await connection.end();

    if (Array.isArray(rows) && rows.length > 0) {
      console.log(`[Database] Tables already exist in ${cfg.database}. Auto-migration skipped.`);
    } else {
      console.log(`[Database] No tables detected in ${cfg.database}. Auto-migrating hostinger-mysql-schema.sql now...`);
      const result = await runDatabaseMigration();
      console.log(`[Database] Auto-migration successfully created ${result.tableCount} tables!`);
    }
  } catch (err) {
    console.warn('[Database] Auto-migration check notice:', err.message);
  }
}

// 1. Health check endpoint for Hostinger process monitor
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'JH IMSE Cloud ERP & POS',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    isConfigured: fs.existsSync(path.join(__dirname, '.env')) || fs.existsSync(path.join(__dirname, 'installed.lock')),
    dbConfigured: Boolean(process.env.DB_NAME && process.env.DB_USER),
  });
});

// 2. Database Connection Test API
app.post('/api/database/test', async (req, res) => {
  try {
    const cfg = getDbConfig(req.body);
    const connection = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      connectTimeout: 8000,
    });
    const [rows] = await connection.query('SELECT 1 + 1 AS test');
    await connection.end();

    res.json({
      success: true,
      message: `MySQL সার্ভার সংযোগ সফল হয়েছে! (${cfg.host}:${cfg.port})`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: `ডাটাবেজ সংযোগ ব্যর্থ: ${err.message}`,
    });
  }
});

// 3. Database Migration Trigger (POST & GET)
app.all('/api/database/migrate', async (req, res) => {
  try {
    const customConfig = req.method === 'POST' ? req.body : null;
    const result = await runDatabaseMigration(customConfig);
    res.json({
      success: true,
      message: `অভিনন্দন! মোট ${result.tableCount}টি টেবিল সফলভাবে তৈরি হয়েছে।`,
      ...result,
    });
  } catch (err) {
    console.error('[Database Migration Error]:', err);
    res.status(500).json({
      success: false,
      error: `স্কিমা মাইগ্রেশন ত্রুটি: ${err.message}`,
    });
  }
});

// 4. Database Status API (lists tables)
app.get('/api/database/status', async (req, res) => {
  try {
    const cfg = getDbConfig();
    if (!cfg.database || !cfg.user) {
      return res.json({ connected: false, message: 'Database credentials not configured yet.' });
    }

    const connection = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      connectTimeout: 8000,
    });

    const [rows] = await connection.query('SHOW TABLES');
    await connection.end();

    const tables = rows.map((r) => Object.values(r)[0]);
    res.json({
      connected: true,
      database: cfg.database,
      tableCount: tables.length,
      tables,
    });
  } catch (err) {
    res.status(500).json({
      connected: false,
      error: err.message,
    });
  }
});

// 5. Server-side installer endpoint: writes .env and creates installed.lock
app.post('/api/installer/save-config', (req, res) => {
  try {
    const { dbConfig, adminData, platformConfig } = req.body;

    const envContent = `# ============================================================================
# JH IMSE - PRODUCTION ENVIRONMENT CONFIGURATION
# Generated on ${new Date().toISOString()}
# ============================================================================
APP_NAME="${platformConfig?.appName || 'JH IMSE Cloud ERP & POS'}"
APP_URL="${platformConfig?.appUrl || 'https://jhsoft.online'}"
APP_ENV="production"
PORT=${PORT}

# HOSTINGER MYSQL DATABASE CONFIGURATION
DB_HOST="${dbConfig?.dbHost || 'localhost'}"
DB_PORT="${dbConfig?.dbPort || '3306'}"
DB_NAME="${dbConfig?.dbName || ''}"
DB_USER="${dbConfig?.dbUser || ''}"
DB_PASSWORD="${dbConfig?.dbPassword || ''}"
DB_CHARSET="${dbConfig?.dbCharset || 'utf8mb4'}"

# SUPER ADMIN CREDENTIALS
SUPER_ADMIN_NAME="${adminData?.adminName || 'Super Admin'}"
SUPER_ADMIN_EMAIL="${adminData?.adminEmail || 'jhsoftcorporation@gmail.com'}"
SUPER_ADMIN_PHONE="${adminData?.adminPhone || ''}"
DEFAULT_CURRENCY="${platformConfig?.defaultCurrency || '৳'}"
TIMEZONE="${platformConfig?.timezone || 'Asia/Dhaka'}"
SYSTEM_INSTALLED=true
`;

    // Write .env securely on server disk
    fs.writeFileSync(path.join(__dirname, '.env'), envContent, { encoding: 'utf8', mode: 0o600 });

    // Create installed.lock
    fs.writeFileSync(
      path.join(__dirname, 'installed.lock'),
      JSON.stringify({ installedAt: new Date().toISOString(), version: '2.0.0' }, null, 2),
      { encoding: 'utf8', mode: 0o644 }
    );

    res.json({ success: true, message: 'Server environment (.env) and installed.lock saved successfully.' });
  } catch (err) {
    console.error('[Installer] Failed to write .env:', err);
    res.status(500).json({ success: false, error: 'Failed to write environment configuration on server.' });
  }
});

// 6. Serve compiled frontend assets from 'dist' directory
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, { maxAge: '1d', index: false }));

  // React SPA routing: Fallback all GET requests to dist/index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If dist is not yet built, serve a friendly bootstrap notice
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>JH IMSE - Building...</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:50px;">
        <h2>JH IMSE Cloud ERP & POS</h2>
        <p>Application is starting or running build step. Please refresh in a few moments.</p>
      </body>
      </html>
    `);
  });
}

// Start Server
app.listen(Number(PORT), HOST, () => {
  console.log(`[JH IMSE] Production server running on http://${HOST}:${PORT}`);
  // Attempt auto-migration on boot
  autoMigrateOnStartup();
});
