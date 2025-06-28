const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const Project = require('../models/project');

const router = express.Router();

router.post('/', 
    authMiddleware,
    [
        body('title').trim().notEmpty().withMessage('Project title is required'),
        body('repoLink')
            .optional({ checkFalsy: true })
            .isURL().withMessage('Repository link must be a valid URL')
    ],
    async (req,res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    try {
        
        const { title, description, techStack, repoLink } = req.body;
        const project = new Project({
            owner: req.userId,
            title,
            description,
            techStack,
            repoLink
         });
         await project.save()
         res.status(201).json(project)
    } catch(err){
        res.status(500).json({message: 'Server error'})
    }

})

router.get('/', async (req,res) => {
    try {
        const projects = await Project.find().populate('owner', 'name email');
        res.json(projects)
    } catch(err){
        res.status(500).json({message: 'Server error'})
    }

})

router.get('/:id', async (req,res) => {
    try {
        const project = await Project.findOne({ id: req.params.id }).populate('owner', 'name email');
        if(!project){
            return res.status(404).json({message: 'Project not found'})
        }
        res.json(project)
    } catch(err){
        res.status(500).json({message: 'Server error'})
    }

})

router.put('/:id', 
    authMiddleware,
    [
    body('repoLink')
      .optional({ checkFalsy: true })
      .isURL().withMessage('Repository link must be a valid URL')
    ],
    async (req,res) => {
    try {
        const { title, description, techStack, repoLink } = req.body;
        const project = await Project.findbyId(req.params.id )
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update this project' });
        }
        if (title?.trim()) project.title = title;
            if (description?.trim()) project.description = description;
            if (Array.isArray(techStack) && techStack.length > 0) project.techStack = techStack;
            if (repoLink?.trim()) project.repoLink = repoLink;   
        await project.save();
        res.json(project);
        
    } catch(err){
        res.status(500).json({message: 'Server error'})
    }

})

router.delete('/:id', authMiddleware, async (req,res) => {
    try {

        const project = await Project.findbyId(req.params.id )
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update this project' });
        }
            await project.deleteOne()
            res.json({message: 'Project deleted'})

        } catch(err) {
        res.send(500).json({message: 'Server error'})
    }

})

router.put('/:id/like', 
    authMiddleware,
    async (req,res) => {
        let userId = req.userId
        try {
            const project = await Project.findById(req.params.id)
            if(!project){
                return res.status(404).json({message: 'Project not found'})
            }
            if (project.likes.includes(userId)){
                project.likes = project.likes.filter(user => user.toString() !== userId)
            } else {
                project.likes.push(userId)
            }
            await project.save();
            res.json({ likes: project.likes.length })
        } catch(err) {
            res.status(500).json({message: 'Server error'})
        }
    })

router.post('/:id/comments', 
    authMiddleware,
    async (req,res) => {
        try {
            const project = await Project.findById(req.params.id)
            if(!project){
                return res.status(404).json({message: 'Project not found'})
            }
            const {text} = req.body
            const newComment = {
                user: req.userId,
                text: text.trim(),
                createdAt: new Date()
            };
            project.comments.push(newComment)
            await project.save();
            res.status(201).json(project)
        } catch {
            res.status(500).json({message: 'Server error'})
        }
    })

module.exports = router;