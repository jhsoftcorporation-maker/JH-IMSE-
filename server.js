import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

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

// 1. Health check endpoint for Hostinger process monitor
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'JH IMSE Cloud ERP & POS',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    isConfigured: fs.existsSync(path.join(__dirname, '.env')) || fs.existsSync(path.join(__dirname, 'installed.lock')),
  });
});

// 2. Server-side installer endpoint: writes .env and creates installed.lock
app.post('/api/installer/save-config', (req, res) => {
  try {
    const { dbConfig, adminData, platformConfig } = req.body;
    
    const envContent = `# ============================================================================
# JH IMSE - PRODUCTION ENVIRONMENT CONFIGURATION
# Generated on ${new Date().toISOString()}
# ============================================================================
APP_NAME="${platformConfig?.appName || 'JH IMSE Cloud ERP & POS'}"
APP_URL="${platformConfig?.appUrl || 'https://jh-imse.shop'}"
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

// 3. Serve compiled frontend assets from 'dist' directory
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
});
