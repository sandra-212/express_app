const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const Profile = require('../models/profile');
const router = express.Router();

router.post(
    '/',
    authMiddleware,
    [
        body('bio')
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 500 }).withMessage('Bio must be 500 characters or less'),

        body('skills')
            .optional({ checkFalsy: true })
            .trim(),

        body('location')
            .optional({ checkFalsy: true })
            .trim(),

        body('social.github')
            .optional({ checkFalsy: true })
            .isURL().withMessage('GitHub must be a valid URL'),

        body('social.linkedin')
            .optional({ checkFalsy: true })
            .isURL().withMessage('LinkedIn must be a valid URL')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { bio, location, skills, social } = req.body;
        const normalizedSkills =
            skills && typeof skills === 'string'
                ? skills.split(',').map(skill => skill.trim()).filter(Boolean)
                : Array.isArray(skills)
                    ? skills.map(skill => skill.trim()).filter(Boolean)
                    : undefined;

        try {
            let profile = await Profile.findOne({ user: req.userId });
            if (!profile && (!bio || !bio.trim())) {
                return res.status(400).json({ message: 'Bio is required when creating a profile' });
            }
            const profileData = {
                user: req.userId
            };

            if (bio !== undefined) profileData.bio = bio.trim();
            if (location !== undefined) profileData.location = location;
            if (social !== undefined) profileData.social = social;
            if (normalizedSkills !== undefined) profileData.skills = normalizedSkills;

            profile = await Profile.findOneAndUpdate(
                { user: req.userId },
                profileData,
                { new: true, upsert: true, runValidators: true });

            res.status(200).json(profile);

        } catch (err) {
            console.error('Error creating/updating profile:', err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

router.get('/', async (req,res) => {
    try {
        const profiles = await Profile.find().populate('user', 'name email role');
        res.json(profiles)
    } catch(err) {
        res.status(500).json({message: 'Server error'})
    }

})

router.get('/:userId', async (req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'name email role');
        if(!profile){
            return res.status(404).json({message: 'Profile not found'})
        }
        res.json(profile)
    } catch {
        res.status(500).json({message: 'Server error'})
    }

})

router.delete('/', authMiddleware, async (req,res) => {
    try {
       await Profile.findAndDelete({user:req.userId})
       
        res.json('Profile deleted')
    } catch (err){
        res.send(500).json({message: 'Server error'})
    }

})

module.exports = router;