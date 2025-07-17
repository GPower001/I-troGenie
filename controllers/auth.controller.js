import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { JWT_SECRET } from '../config.js';

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // 2. Create new user
        const user = new User({ name, email, password });
        await user.save();

        // 3. Generate token
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
            expiresIn: '7d'
        });

        // 4. Save token to user
        user.tokens.push({ token });
        await user.save();

        // 5. Return user and token (excluding sensitive data)
        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });

    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // 2. Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // 3. Generate token
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, { 
            expiresIn: '7d' 
        });
        
        // 4. Save token to user
        user.tokens.push({ token });
        await user.save();
        
        // 5. Return user and token (excluding sensitive data)
        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};