const Vendor = require('../models/Vendor');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function signup(req, res) {
  const { name, email, phone, description, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });

  const existing = await Vendor.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    if (existing.status === 'blocked') return res.status(403).json({ error: 'This email is blocked from registering' });
    return res.status(400).json({ error: 'Email already registered' });
  }

  const vendor = new Vendor({ name, email: email.toLowerCase().trim(), phone: phone || '', description: description || '', password, status: 'pending', emailVerified: false });

  // generate otp and expiry
  const otp = generateOtp();
  const minutes = parseInt(process.env.VENDOR_OTP_EXPIRES_MIN) || 10;
  vendor.emailOtp = otp;
  vendor.emailOtpExpires = new Date(Date.now() + minutes * 60 * 1000);

  await vendor.save();

  // Send OTP (console log for now)
  console.log(`Vendor signup OTP for ${vendor.email}: ${otp} (expires in ${minutes} minutes)`);

  res.status(201).json({ message: 'Signup successful. Verify email with OTP sent to the provided email.' });
}

async function verifyEmail(req, res) {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and otp are required' });

  const vendor = await Vendor.findOne({ email: email.toLowerCase().trim() });
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

  if (vendor.emailVerified) return res.status(400).json({ error: 'Email already verified' });

  if (!vendor.emailOtp || !vendor.emailOtpExpires) return res.status(400).json({ error: 'No OTP found, request another one' });

  if (new Date() > vendor.emailOtpExpires) return res.status(400).json({ error: 'OTP expired' });

  if (vendor.emailOtp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

  vendor.emailVerified = true;
  vendor.emailOtp = null;
  vendor.emailOtpExpires = null;
  await vendor.save();

  res.json({ message: 'Email verified successfully' });
}

module.exports = { signup, verifyEmail };
