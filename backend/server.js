const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { initDatabase, loadStore, saveStore, dbFile } = require('./db')

dotenv.config()
const app = express()
const PORT = Number(process.env.PORT || 5050)

const seed = {
  users: [],
  properties: [
    { id: 1, title: 'Lakeview Residence', type: 'Apartment', status: 'sale', location: 'Gulshan 2, Dhaka', city: 'Dhaka', price: 285000, bedrooms: 3, bathrooms: 3, area: 1850, description: 'A sunlit apartment with quiet lake views, generous living spaces, and thoughtful modern finishes.', image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=85&auto=format&fit=crop', amenities: ['Parking', 'Security', 'Balcony', 'AC'], agent: 'Nusrat Jahan', rating: 4.9, reviews: 28, created_at: '2026-09-24T10:00:00.000Z' },
    { id: 2, title: 'The Garden Villa', type: 'Villa', status: 'sale', location: 'Banani, Dhaka', city: 'Dhaka', price: 620000, bedrooms: 5, bathrooms: 4, area: 4200, description: 'A private garden villa designed for relaxed family living with bright interiors and secure parking.', image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85&auto=format&fit=crop', amenities: ['Garden', 'Garage', 'Generator', 'CCTV'], agent: 'Farhan Islam', rating: 4.8, reviews: 19, created_at: '2026-09-18T10:00:00.000Z' },
    { id: 3, title: 'Riverside Studio', type: 'Studio', status: 'rent', location: 'Dhanmondi, Dhaka', city: 'Dhaka', price: 780, bedrooms: 1, bathrooms: 1, area: 680, description: 'A calm, furnished studio close to cafes, transit, and the city’s best everyday conveniences.', image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=85&auto=format&fit=crop', amenities: ['Furnished', 'Wi-Fi', 'Security'], agent: 'Karim Uddin', rating: 4.7, reviews: 14, created_at: '2026-09-12T10:00:00.000Z' },
    { id: 4, title: 'Urban Courtyard House', type: 'House', status: 'rent', location: 'Uttara, Dhaka', city: 'Dhaka', price: 1450, bedrooms: 4, bathrooms: 3, area: 2400, description: 'A welcoming home with a private courtyard, flexible rooms, and excellent access to schools and shops.', image_url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=85&auto=format&fit=crop', amenities: ['Parking', 'Garden', 'Pet Friendly'], agent: 'Nusrat Jahan', rating: 4.6, reviews: 11, created_at: '2026-09-08T10:00:00.000Z' }
  ],
  inquiries: []
}

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use((req, res, next) => { res.setHeader('X-Content-Type-Options', 'nosniff'); next() })

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'realnest-api', database: 'sqlite', databaseFile: dbFile, timestamp: new Date().toISOString() }))
app.use('/api/auth', require('./routes/auth')({ loadStore, saveStore }))
app.use('/api/admin', require('./routes/admin')({ loadStore, saveStore }))
app.use('/api/properties', require('./routes/property')({ loadStore, saveStore }))
app.post('/api/inquiries', (req, res) => {
  const { propertyId, name, email, phone = '', message = '' } = req.body || {}
  if (!propertyId || !name?.trim() || !email?.trim()) return res.status(400).json({ message: 'Property, name, and email are required.' })
  const store = loadStore()
  const inquiry = { id: Date.now(), propertyId: Number(propertyId), name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), message: message.trim(), created_at: new Date().toISOString() }
  store.inquiries.push(inquiry)
  saveStore(store)
  res.status(201).json({ message: 'Inquiry sent successfully.', inquiry })
})
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ message: 'Internal server error.' }) })

initDatabase(seed)
  .then(() => app.listen(PORT, '0.0.0.0', () => console.log(`RealNest API listening on http://0.0.0.0:${PORT} using SQLite at ${dbFile}`)))
  .catch(error => { console.error('Database initialization failed:', error); process.exit(1) })
