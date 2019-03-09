const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Post = require('../models/Post');
const checkAuth = require('../middlewares/check-auth');

const checkAdmin = (req, res, next) => {
    if (!req.user.roles.includes('ADMIN')) {
        return res.status(401).json({message: 'You are not admin.'});
    }
    next();
};

router.post('/users/:id',
    checkAuth,
    checkAdmin,
    async (req, res) => {
        const {id} = req.params;
        try {
            const user = await User.findById(id);
            user.username = req.body.username;

            await user.save();

            res.status(200).json({message: 'User updated.'});
        } catch (e) {
            res.status(422).json({message: e.message});
        }
    });

router.delete('/users/:id',
    checkAuth,
    checkAdmin,
    async (req, res) => {
        const {id} = req.params;
        try {
            await Post.deleteMany({author: id});
            await User.remove({_id: id});
            res.status(200).json({message: 'User deleted.'});
        } catch (e) {
            res.status(422).json({message: e.message});
        }
    });

module.exports = router;
