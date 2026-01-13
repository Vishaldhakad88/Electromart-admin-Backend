require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT =  8000;

(async function startServer() {
  try {
    // 1️⃣ Connect Database
    await connectDB();
    console.log('✅ Database connected');

    // 2️⃣ SMTP verification (optional, non-fatal)
    const { verifyTransporter, SMTP_ENABLED } = require('./utils/emailService');

    if (SMTP_ENABLED === true || SMTP_ENABLED === 'true') {
      verifyTransporter()
        .then(() => console.log('✅ SMTP verified'))
        .catch((err) =>
          console.warn('⚠️ SMTP verification failed:', err.message)
        );
    } else {
      console.log('ℹ️ SMTP disabled, skipping verification');
    }

    // 3️⃣ Root route
    app.get('/', (req, res) => {
      res.status(200).send('Welcome to the ElectroMart Admin API');
    });

    // 4️⃣ Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 ElectroMart Admin API running on port ${PORT}`);
    });

    // 5️⃣ Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} already in use`);
      } else {
        console.error('❌ Server error:', err);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
