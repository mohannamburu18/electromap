const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
});

/** Register */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const user = await User.create({ name, email, password, role: role === 'admin' ? 'admin' : 'user' });
    res.json({ token: sign(user._id), user: { id: user._id, name, email, role: user.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** Login */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    res.json({
      token: sign(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/** Me */
router.get('/me', auth, (req, res) => res.json({ user: req.user }));

module.exports = router;
