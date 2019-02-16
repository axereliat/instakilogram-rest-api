const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Post = require('../models/Post');
const checkAuth = require('../middlewares/check-auth');
const cloudUploadMultiple = require('../services/cloudinary-upload-multiple');

router.post('/',
    checkAuth,
    cloudUploadMultiple('images', ['image/jpeg', 'image/jpg', 'image/png']),
    async (req, res) => {
        if (!req.body.description && !req.body.files.length) {
            return res.json({error: 'Please enter at least a description or one photo'});
        }

        const post = new Post({
            description: req.body.description || '',
            photos: req.body.files,
            author: mongoose.Types.ObjectId(req.user.userId),
            comments: [],
            likes: []
        });

        try {
            await post.save();
        } catch (err) {
            res.json({error: err.message})
        }
    });

module.exports = router;
