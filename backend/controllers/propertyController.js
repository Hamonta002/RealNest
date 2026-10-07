const db = require('../config/db');

// 1. GET ALL PROPERTIES (Public)
exports.getAllProperties = async (req, res) => {
    try {
        const [properties] = await db.query('SELECT * FROM properties');
        res.status(200).json(properties);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 2. CREATE A PROPERTY (Protected - Needs Token)
exports.createProperty = async (req, res) => {
    try {
        const { title, description, price, location, status } = req.body;

        // The user ID comes from the JWT Token (added by our bouncer middleware!)
        const userId = req.user.userId;

        if (!title || !price || !location) {
            return res.status(400).json({ message: 'Please provide title, price, and location' });
        }

        const [result] = await db.query(
            'INSERT INTO properties (owner_id, title, description, price, location, status) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, title, description, price, location, status || 'sale']
        );

        res.status(201).json({
            message: 'Property created successfully!',
            propertyId: result.insertId
        });

    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ message: 'Server error while creating property' });
    }
};
// 3. UPDATE A PROPERTY (Protected - Needs Token)
exports.updateProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user.userId;
        const { title, description, price, location, status } = req.body;

        // First, check if this property belongs to the logged-in user
        const [property] = await db.query('SELECT * FROM properties WHERE id = ? AND owner_id = ?', [propertyId, userId]);

        if (property.length === 0) {
            return res.status(404).json({ message: 'Property not found or you are not the owner' });
        }

        // Update the property
        await db.query(
            'UPDATE properties SET title = ?, description = ?, price = ?, location = ?, status = ? WHERE id = ? AND owner_id = ?',
            [title, description, price, location, status, propertyId, userId]
        );

        res.status(200).json({ message: 'Property updated successfully!' });

    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ message: 'Server error while updating property' });
    }
};

// 4. DELETE A PROPERTY (Protected - Needs Token)
exports.deleteProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user.userId;

        // Check if this property belongs to the logged-in user
        const [property] = await db.query('SELECT * FROM properties WHERE id = ? AND owner_id = ?', [propertyId, userId]);

        if (property.length === 0) {
            return res.status(404).json({ message: 'Property not found or you are not the owner' });
        }

        // Delete the property
        await db.query('DELETE FROM properties WHERE id = ? AND owner_id = ?', [propertyId, userId]);

        res.status(200).json({ message: 'Property deleted successfully!' });

    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ message: 'Server error while deleting property' });
    }
};

// 5. GET SINGLE PROPERTY BY ID (Public)
exports.getPropertyById = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const [rows] = await db.query('SELECT * FROM properties WHERE id = ?', [propertyId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ message: 'Server error' });
    }
};