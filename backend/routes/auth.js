const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const router = express.Router()
const SECRET = process.env.JWT_SECRET || 'realnest-development-secret'
const googleClient = new OAuth2Client()
const publicUser = ({ password, ...user }) => user
function tokenFor(user) { return jwt.sign({ userId: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' }) }
function auth(req, res, next) { const token = req.headers.authorization?.replace('Bearer ', ''); try { req.user = jwt.verify(token, SECRET); next() } catch { res.status(401).json({ message: 'Invalid or expired session.' }) } }
function safeRole(role) { return role === 'agent' ? 'agent' : 'customer' }

module.exports = ({ loadStore, saveStore }) => {
  router.post('/register', async (req, res) => {
    const { name, email, password, phone = '', role = 'customer' } = req.body || {}
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) return res.status(400).json({ message: 'Name, valid email, and a 6-character password are required.' })
    const store = loadStore(); const normalized = email.trim().toLowerCase()
    if (store.users.some(u => u.email === normalized)) return res.status(409).json({ message: 'An account with this email already exists.' })
    const user = { id: Date.now(), name: name.trim(), email: normalized, phone: phone.trim(), role: safeRole(role), password: await bcrypt.hash(password, 12), google_id: null, avatar_url: '', created_at: new Date().toISOString() }
    store.users.push(user); saveStore(store)
    res.status(201).json({ message: 'Account created successfully.', user: publicUser(user) })
  })

  router.post('/login', async (req, res) => {
    const { email, password } = req.body || {}; const store = loadStore()
    const user = store.users.find(u => u.email === String(email || '').trim().toLowerCase())
    const valid = user?.password && await bcrypt.compare(password || '', user.password)
    if (!valid) return res.status(401).json({ message: 'Invalid email or password.' })
    res.json({ token: tokenFor(user), user: publicUser(user) })
  })

  router.post('/google', async (req, res) => {
    const { credential, role = 'customer' } = req.body || {}
    if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ message: 'Google login is not configured. Add GOOGLE_CLIENT_ID to backend/.env and VITE_GOOGLE_CLIENT_ID to frontend .env.' })
    if (!credential) return res.status(400).json({ message: 'Google credential is required.' })
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID })
      const payload = ticket.getPayload(); const store = loadStore()
      let user = store.users.find(item => item.google_id === payload.sub || item.email === payload.email)
      if (!user) {
        user = { id: Date.now(), name: payload.name || payload.email.split('@')[0], email: payload.email.toLowerCase(), phone: '', role: safeRole(role), password: null, google_id: payload.sub, avatar_url: payload.picture || '', created_at: new Date().toISOString() }
        store.users.push(user)
      } else {
        user.google_id = payload.sub; user.avatar_url = payload.picture || user.avatar_url || ''; user.name = payload.name || user.name
      }
      saveStore(store); res.json({ token: tokenFor(user), user: publicUser(user) })
    } catch (error) { console.error('Google token verification failed:', error.message); res.status(401).json({ message: 'Google sign-in could not be verified.' }) }
  })

  router.get('/profile', auth, (req, res) => { const user = loadStore().users.find(u => u.id === req.user.userId); user ? res.json({ user: publicUser(user) }) : res.status(404).json({ message: 'User not found.' }) })
  return router
}
