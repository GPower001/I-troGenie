import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { config } from 'dotenv';

config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret-key';

const authMiddleware = async (req, res, next) => {
    try {
        // 1. Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Authentication required. Please login.' 
            });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Find user and attach to request
        const user = await User.findOne({ 
            _id: decoded._id, 
            'tokens.token': token  // Check if token exists in user's tokens array
        }).select('-password'); // Exclude password field

        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid authentication. Please login again.' 
            });
        }

        // 4. Attach user and token to request
        req.user = user;
        req.token = token;
        
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        
        // Handle different JWT errors specifically
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token. Please login again.' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Session expired. Please login again.' 
            });
        }

        res.status(500).json({ 
            error: 'Authentication failed. Please try again.' 
        });
    }
};

export default authMiddleware;