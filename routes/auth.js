const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', 
    async (req,res) => {
        try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'fields must not be empty' });
        }
        const user = await User.findOne({email})
        if(user){
            return res.status(409).json({ message: 'user alresy exists' })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        })

        await newUser.save()
        res.status(201).json({ message: 'User registered successfully' })
        
        } catch(err) {
            res.send(500).json({message: 'Server error'})
        }

    })

router.post('/login', 
    async (req,res) => {
        try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'fields must not be empty' });
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(409).json({ message: 'user alresy exists' })
        }
        const hashedPassword= user.password
        const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
        if(!isMatch){
            return res.status(401).json({ message: 'Invalid password' })
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, 
                { expiresIn: '1h' });
         
        res.status(200).json({ token })
        
        } catch(err) {
            res.send(500).json({message: 'Server error'})
        }

    })

router.get('/me', authMiddleware, async (req,res) => {
    try {
        const user = await User.findById(req.userId ).select('-password')
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _id: user._id, 
            name: user.name,
            email: user.email,
            role: user.role
         });
    } catch(err) {
        res.status(500).json({message: 'Server error'})
    }

})

module.exports = router;