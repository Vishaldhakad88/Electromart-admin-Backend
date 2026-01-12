const VendorRequest = require('../models/VendorRequest');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/v1/vendor-requests
async function submitRequest(req, res) {
  const { email, phone, location, description, category } = req.body;
  if (!email || !phone || !location) return res.status(400).json({ error: 'Email, phone and location are required' });

  const existingVendorRequest = await VendorRequest.findOne({ email: email.toLowerCase().trim() });
  if (existingVendorRequest) {
    // If already approved or pending, inform client
    if (existingVendorRequest.status === 'approved') return res.status(400).json({ error: 'A vendor account already exists for this email' });
    // regenerate OTP if request exists and not approved
    const otp = generateOtp();
    const minutes = parseInt(process.env.VENDOR_OTP_EXPIRES_MIN) || 10;
    existingVendorRequest.emailOtp = otp;
    existingVendorRequest.emailOtpExpires = new Date(Date.now() + minutes * 60 * 1000);
    existingVendorRequest.phone = phone || existingVendorRequest.phone;
    existingVendorRequest.location = location || existingVendorRequest.location;
    existingVendorRequest.description = description || existingVendorRequest.description;
    existingVendorRequest.category = category || existingVendorRequest.category;
    await existingVendorRequest.save();

    // Attempt to send OTP email (non-blocking)
    try {
      const { sendEmail } = require('../utils/emailService');
      await sendEmail({
        to: existingVendorRequest.email,
        subject: 'ElectroMart – Vendor Email Verification',
        text: `Your OTP is ${otp}. It is valid for ${minutes} minutes.`
      });
    } catch (err) {
      console.error('Failed to send OTP email to %s: %s', existingVendorRequest.email, err && err.message ? err.message : err);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`Vendor request OTP for ${existingVendorRequest.email}: ${otp} (expires in ${minutes} minutes)`);
    }

    return res.status(201).json({ message: 'Vendor request submitted. Verify email with OTP.' });
  }

  const otp = generateOtp();
  const minutes = parseInt(process.env.VENDOR_OTP_EXPIRES_MIN) || 10;

  const vr = new VendorRequest({
    email: email.toLowerCase().trim(),
    phone: phone || '',
    location: location || '',
    description: description || '',
    category: category || '',
    emailOtp: otp,
    emailOtpExpires: new Date(Date.now() + minutes * 60 * 1000),
    emailVerified: false,
    status: 'pending'
  });

  await vr.save();

  // Attempt to send OTP email (non-blocking)
  try {
    const { sendEmail } = require('../utils/emailService');
    await sendEmail({
      to: vr.email,
      subject: 'ElectroMart – Vendor Email Verification',
      text: `Your OTP is ${otp}. It is valid for ${minutes} minutes.`
    });
  } catch (err) {
    console.error('Failed to send OTP email to %s: %s', vr.email, err && err.message ? err.message : err);
  }

  // Preserve console OTP in non-production for convenience
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Vendor request OTP for ${vr.email}: ${otp} (expires in ${minutes} minutes)`);
  }

  res.status(201).json({ message: 'Vendor request submitted. Verify email with OTP.' });
}

// POST /api/v1/vendor-requests/verify-otp
async function verifyOtp(req, res) {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and otp are required' });

  const vr = await VendorRequest.findOne({ email: email.toLowerCase().trim() });
  if (!vr) return res.status(404).json({ error: 'Vendor request not found' });

  if (vr.emailVerified) return res.status(400).json({ error: 'Email already verified' });

  if (!vr.emailOtp || !vr.emailOtpExpires) return res.status(400).json({ error: 'No OTP found, request another one' });
  if (new Date() > vr.emailOtpExpires) return res.status(400).json({ error: 'OTP expired' });
  if (vr.emailOtp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

  vr.emailVerified = true;
  vr.emailOtp = null;
  vr.emailOtpExpires = null;
  await vr.save();

  res.json({ message: 'Email verified successfully' });
}

module.exports = { submitRequest, verifyOtp };
