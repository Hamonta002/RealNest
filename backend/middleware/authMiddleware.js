const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Get the token from the request headers
    // The token usually comes in a header called "Authorization" looking like: "Bearer <token>"
    const authHeader = req.header('Authorization');

    // If there is no header at all, block them
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // 2. Extract the token (remove the word "Bearer ")
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access denied. Token is missing.' });
        }

        // 3. Verify the token using our Secret Key
        const verified = jwt.verify(token, process.env.JWT_SECRET);

        // 4. If valid, attach the user's ID to the request so the next function can use it
        req.user = verified;

        // 5. Let them pass to the actual route!
        next();

    } catch (error) {
        // If the token is fake, expired, or tampered with
        res.status(400).json({ message: 'Invalid token.' });
    }
};
