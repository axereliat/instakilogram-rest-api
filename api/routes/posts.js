const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Post = require('../models/Post');
const User = require('../models/User');
const checkAuth = require('../middlewares/check-auth');
const cloudUploadMultiple = require('../services/cloudinary-upload-multiple');

router.post('/',
    checkAuth,
    cloudUploadMultiple('images', ['image/jpeg', 'image/jpg', 'image/png']),
    async (req, res) => {
        console.log(req.body.files);
        if (!req.body.files.length) {
            return res.status(422).json({error: 'Please select at least one photo.'});
        }

        const post = new Post({
            description: req.body.description || '',
            photos: req.body.files,
            author: mongoose.Types.ObjectId(req.user.userId),
            comments: [],
            likes: []
        });

        try {
            const user = await User.findById(req.user.userId);
            user.posts.push(post);
            await user.save();

            await post.save();
            res.json({message: 'Post created.'});
        } catch (err) {
            res.json({error: err.message})
        }
    });

router.get('/newsfeed',
    checkAuth,
    async (req, res) => {
        try {
            const currentUser = await User.findById(req.user.userId);
            console.log(currentUser);
            const posts = (await Post.find({}).populate('author'))
                .filter(p => currentUser.following.map(x => x.toString()).includes(p.author._id.toString()));

            res.status(200).json(posts);
        } catch (err) {
            res.status(500).json(err);
        }
    });

module.exports = router;
