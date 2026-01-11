require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const fetch = require('node-fetch');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });

    const email = 'signup-test@example.com';
    // cleanup old
    await Vendor.deleteOne({ email });

    // signup
    const signupRes = await fetch('http://localhost:5000/api/v1/vendor/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Signup Test', email, password: 'TestPass123!', phone: '1234567890' })
    });
    console.log('Signup status', signupRes.status, await signupRes.json());

    // read OTP from DB (test-only script)
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      console.error('Vendor not found after signup');
      process.exit(1);
    }
    console.log('OTP (from DB, test only):', vendor.emailOtp);

    // verify
    const verifyRes = await fetch('http://localhost:5000/api/v1/vendor/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: vendor.emailOtp })
    });
    console.log('Verify status', verifyRes.status, await verifyRes.json());

    // verify again should give already verified
    const verifyRes2 = await fetch('http://localhost:5000/api/v1/vendor/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: vendor.emailOtp })
    });
    console.log('Verify again status', verifyRes2.status, await verifyRes2.json());

    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();