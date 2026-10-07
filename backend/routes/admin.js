const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()
const SECRET = process.env.JWT_SECRET || 'realnest-development-secret'

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  try {
    const user = jwt.verify(token, SECRET)
    if (user.role !== 'admin') return res.status(403).json({ message: 'Admin access is required.' })
    req.user = user
    next()
  } catch { res.status(401).json({ message: 'Please sign in as an administrator.' }) }
}
function publicUser({ password, ...user }) { return user }

module.exports = ({ loadStore, saveStore }) => {
  router.use(requireAdmin)

  router.get('/overview', (req, res) => {
    const store = loadStore()
    res.json({
      stats: {
        totalUsers: store.users.length,
        agents: store.users.filter(user => user.role === 'agent').length,
        customers: store.users.filter(user => user.role === 'customer').length,
        pendingListings: store.properties.filter(property => property.approval_status === 'pending').length,
        approvedListings: store.properties.filter(property => property.approval_status === 'approved').length,
      },
      users: store.users.filter(user => user.role !== 'admin').map(publicUser),
      pendingListings: store.properties.filter(property => property.approval_status === 'pending'),
    })
  })

  router.patch('/users/:id/role', (req, res) => {
    const role = req.body?.role
    if (!['customer', 'agent'].includes(role)) return res.status(400).json({ message: 'Role must be customer or agent.' })
    const store = loadStore(); const user = store.users.find(item => item.id === Number(req.params.id) && item.role !== 'admin')
    if (!user) return res.status(404).json({ message: 'User not found.' })
    user.role = role; saveStore(store); res.json({ message: 'User role updated.', user: publicUser(user) })
  })

  router.delete('/users/:id', (req, res) => {
    const store = loadStore(); const index = store.users.findIndex(item => item.id === Number(req.params.id) && item.role !== 'admin')
    if (index < 0) return res.status(404).json({ message: 'User not found.' })
    store.users.splice(index, 1); saveStore(store); res.json({ message: 'User removed.' })
  })

  router.patch('/properties/:id/status', (req, res) => {
    const approvalStatus = req.body?.approval_status
    if (!['approved', 'rejected', 'pending'].includes(approvalStatus)) return res.status(400).json({ message: 'Invalid listing decision.' })
    const store = loadStore(); const property = store.properties.find(item => item.id === Number(req.params.id))
    if (!property) return res.status(404).json({ message: 'Property not found.' })
    property.approval_status = approvalStatus
    property.rejection_reason = approvalStatus === 'rejected' ? String(req.body?.rejection_reason || 'Listing needs updates before approval.').trim() : ''
    saveStore(store); res.json({ message: `Listing ${approvalStatus}.`, property })
  })

  return router
}
