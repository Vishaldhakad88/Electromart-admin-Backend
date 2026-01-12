require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();

    // Verify SMTP transporter (non-fatal). Only attempt verification when SMTP_ENABLED=true
    const { verifyTransporter, SMTP_ENABLED } = require('./utils/emailService');
    if (SMTP_ENABLED) {
      verifyTransporter().catch(() => { /* verification failure already logged in verifyTransporter */ });
    } else {
      console.log('SMTP disabled by configuration; skipping verification');
    }

    const server = app.listen(PORT, () => {
      console.log(`ElectroMart Admin API server listening on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Free it or set PORT env var.`);
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
