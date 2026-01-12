const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  const expiresIn = process.env.USER_JWT_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn });
};

// =====================
// SIGNUP
// =====================
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    console.log(`[userAuthController] User signup: ${user.email}`);

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('[userAuthController] signup error:', err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join('; ') });
    }
    res.status(500).json({ error: 'Signup failed' });
  }
};

// =====================
// LOGIN
// =====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log(`[userAuthController] User login: ${user.email}`);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('[userAuthController] login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = {
  signup,
  login
};
