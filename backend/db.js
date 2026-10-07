const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, 'data')
const dbFile = path.join(dataDir, 'realnest.sqlite')
let db
let store

function run(sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function onRun(error) { error ? reject(error) : resolve(this) }))
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)))
}
function exec(sql) {
  return new Promise((resolve, reject) => db.exec(sql, error => error ? reject(error) : resolve()))
}

async function initDatabase(seed) {
  fs.mkdirSync(dataDir, { recursive: true })
  db = new sqlite3.Database(dbFile)
  await exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT DEFAULT '',
      role TEXT NOT NULL DEFAULT 'customer',
      password TEXT,
      google_id TEXT UNIQUE,
      avatar_url TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      location TEXT NOT NULL,
      city TEXT NOT NULL,
      price REAL NOT NULL,
      bedrooms INTEGER DEFAULT 0,
      bathrooms INTEGER DEFAULT 0,
      area REAL DEFAULT 0,
      description TEXT NOT NULL,
      image_url TEXT DEFAULT '',
      amenities TEXT DEFAULT '[]',
      agent TEXT DEFAULT 'RealNest Agent',
      agentPhone TEXT DEFAULT '',
      agentEmail TEXT DEFAULT '',
      owner_id INTEGER,
      rating REAL DEFAULT 0,
      reviews INTEGER DEFAULT 0,
      approval_status TEXT NOT NULL DEFAULT 'approved',
      rejection_reason TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY,
      propertyId INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      message TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );
  `)
  const columns = await all('PRAGMA table_info(properties)')
  if (!columns.some(column => column.name === 'approval_status')) await run("ALTER TABLE properties ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'approved'")
  if (!columns.some(column => column.name === 'rejection_reason')) await run("ALTER TABLE properties ADD COLUMN rejection_reason TEXT DEFAULT ''")

  const count = (await all('SELECT COUNT(*) AS count FROM properties'))[0].count
  if (count === 0) {
    let legacy = null
    const legacyFile = path.join(dataDir, 'store.json')
    if (fs.existsSync(legacyFile)) {
      try { legacy = JSON.parse(fs.readFileSync(legacyFile, 'utf8')) } catch {}
    }
    const source = legacy?.properties?.length ? legacy : seed
    await importStore(source)
  }
  await ensureAdminUser()
  store = await readStore()
  return dbFile
}

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) return
  const bcrypt = require('bcryptjs')
  const existing = (await all('SELECT id FROM users WHERE email = ?', [email]))[0]
  const hash = await bcrypt.hash(password, 12)
  if (existing) await run("UPDATE users SET role='admin', password=?, name=? WHERE id=?", [hash, process.env.ADMIN_NAME?.trim() || 'RealNest Admin', existing.id])
  else await run('INSERT INTO users (id,name,email,phone,role,password,google_id,avatar_url,created_at) VALUES (?,?,?,?,?,?,?,?,?)', [Date.now(), process.env.ADMIN_NAME?.trim() || 'RealNest Admin', email, '', 'admin', hash, null, '', new Date().toISOString()])
}

async function importStore(source, replace = false) {
  await exec('BEGIN')
  try {
    if (replace) {
      await run('DELETE FROM inquiries')
      await run('DELETE FROM properties')
      await run('DELETE FROM users')
    }
    for (const user of source.users || []) {
      await run('INSERT OR IGNORE INTO users (id,name,email,phone,role,password,google_id,avatar_url,created_at) VALUES (?,?,?,?,?,?,?,?,?)', [user.id, user.name, user.email, user.phone || '', user.role || 'customer', user.password || null, user.google_id || null, user.avatar_url || '', user.created_at || new Date().toISOString()])
    }
    for (const p of source.properties || []) {
      await run('INSERT OR IGNORE INTO properties (id,title,type,status,location,city,price,bedrooms,bathrooms,area,description,image_url,amenities,agent,agentPhone,agentEmail,owner_id,rating,reviews,approval_status,rejection_reason,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [p.id, p.title, p.type, p.status, p.location, p.city || p.location, p.price, p.bedrooms || 0, p.bathrooms || 0, p.area || 0, p.description, p.image_url || p.image || '', JSON.stringify(p.amenities || []), p.agent || 'RealNest Agent', p.agentPhone || '', p.agentEmail || '', p.owner_id || null, p.rating || 0, p.reviews || 0, p.approval_status || 'approved', p.rejection_reason || '', p.created_at || new Date().toISOString()])
    }
    for (const item of source.inquiries || []) {
      await run('INSERT OR IGNORE INTO inquiries (id,propertyId,name,email,phone,message,created_at) VALUES (?,?,?,?,?,?,?)', [item.id, item.propertyId, item.name, item.email, item.phone || '', item.message || '', item.created_at || new Date().toISOString()])
    }
    await exec('COMMIT')
  } catch (error) { await exec('ROLLBACK'); throw error }
}

async function readStore() {
  const [users, properties, inquiries] = await Promise.all([
    all('SELECT * FROM users ORDER BY created_at DESC'),
    all('SELECT * FROM properties ORDER BY datetime(created_at) DESC'),
    all('SELECT * FROM inquiries ORDER BY datetime(created_at) DESC')
  ])
  return {
    users,
    properties: properties.map(p => ({ ...p, amenities: JSON.parse(p.amenities || '[]'), approval_status: p.approval_status || 'approved', rejection_reason: p.rejection_reason || '' })),
    inquiries
  }
}

function loadStore() { return store }
function saveStore(nextStore) {
  store = nextStore
  void importStore(nextStore, true).catch(error => console.error('Database write failed:', error))
}

module.exports = { initDatabase, loadStore, saveStore, dbFile }
