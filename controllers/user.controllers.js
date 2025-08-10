import bcrypt from 'bcrypt';
import {User} from '../models/user.models.js';
import { generateToken } from '../utils/auth.utils.js'



export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        const token = generateToken(user);

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
        });

        user.password = undefined;
        res.status(200).json({ user: user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const signup = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Incomplete Credentials" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        const token = generateToken(newUser);


        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
        });
        newUser.password = undefined;
        res.status(201).json({ user: newUser });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
};

export const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

export const updateAbout = async (req, res) => {
    const userId = req.user.id;
    const { about } = req.body;

    try {
        await User.updateOne({ _id: userId }, { $set: { about } });
        res.status(200).json({ message: 'About section updated successfully' });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params; 
        const user = await User.findById(userId).select('-password'); 

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

