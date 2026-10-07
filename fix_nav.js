const fs = require('fs');
let c = fs.readFileSync('src/components/Navbar.jsx', 'utf8');
c = c.replace(
    /<div className="nb__auth" role="group" aria-label="Account actions">[\s\S]*?<\/div>/,
    <div className="nb__auth" role="group" aria-label="Account actions">
      {localStorage.getItem('token') ? (
        <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="nb__auth-btn nb__auth-btn--solid" style={{cursor:'pointer'}}>Logout</button>
      ) : (
        <>
          <NavLink to="/login" className="nb__auth-btn nb__auth-btn--ghost">Login</NavLink>
          <NavLink to="/register" className="nb__auth-btn nb__auth-btn--solid">Register</NavLink>
        </>
      )}
    </div>
);
fs.writeFileSync('src/components/Navbar.jsx', c);
