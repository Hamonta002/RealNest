const bcrypt = require('bcryptjs');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        // 1. Get the data from the frontend
        const { name, email, password } = req.body;

        // 2. Basic validation (make sure all fields are provided)
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // 3. Check if the user already exists in the database
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // 4. Hash the password before saving it (10 is the salt round - standard security level)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Save the new user into the database
        const [result] = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        // 6. Send a success response back to the frontend
        res.status(201).json({
            message: 'User registered successfully!',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // 2. Find the user by email
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0]; // This is the user object from the database

        // 3. Compare the provided password with the hashed password in the DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 4. Create the JWT Token (The VIP Pass)
        const token = jwt.sign(
            { userId: user.id }, // The payload (data inside the token)
            process.env.JWT_SECRET, // The secret key to sign it
            { expiresIn: '1d' } // Token expires in 1 day
        );

        // 5. Send the token back to the user
        res.status(200).json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};
