const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const checkAuth = require('../middlewares/check-auth');
const cloudUpload = require('../services/cloudinary-upload');

const validUsername = (req, res, next) => {
    User.find({username: req.body.username})
        .exec()
        .then(user => {
            if (user.length > 0) {
                return res.status(409).json({
                    error: 'Username exists'
                }).end();
            }

            next();
        })
        .catch(err => {
            return res.status(500).json({
                error: err.message
            }).end();
        });
};

router.post('/register',
    cloudUpload('image', ['image/jpeg', 'image/jpg', 'image/png']),
    validUsername,
    (req, res) => {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                }).end();
            }

            User.find({})
                .then(users => {
                    let roles = ['USER'];
                    if (users.length === 0) {
                        roles.push('ADMIN');
                    }

                    const user = new User({
                        username: req.body.username,
                        password: hash,
                        roles,
                        profilePicture: req.body.imageUrl || 'https://res.cloudinary.com/dr8ovbzd2/image/upload/v1534048322/no-user.png',
                        followers: [],
                        following: [],
                        posts: []
                    });

                    user.save()
                        .then(result => {
                            res.status(201).json({
                                message: 'User created!'
                            }).end();
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: err.message
                            }).end();
                        })
                })
                .catch(err => {
                    return res.status(500).json({
                        message: err.message
                    })
                });
        });
    });

router.post('/login', (req, res) => {
    User.find({username: req.body.username})
        .exec()
        .then(users => {
            if (users.length === 0) {
                return res.status(401).json({
                    message: 'Auth failed'
                }).end();
            }
            bcrypt.compare(req.body.password, users[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    }).end();
                }
                if (result) {
                    return res.status(200).json({
                        message: 'Auth succeeded',
                        token: jwt.sign({
                            username: users[0].username,
                            userId: users[0]._id,
                            roles: users[0].roles
                        }, 'SECRET'),
                        username: users[0].username,
                        userId: users[0].id,
                        roles: users[0].roles
                    })
                }
                return res.status(401).json({
                    message: 'Auth failed'
                }).end();
            })
        })
        .catch(err => {
            return res.status(500).json({
                error: err.message
            }).end();
        });
});

router.get('/all', async (req, res) => {
    const users = await User.find({ username: { "$regex": req.query.search, "$options": "i" } });

    res.status(200).json(users);
});

router.get('/profile/:id', async (req, res) => {
    const user = await User.findById(req.params.id).populate('posts');

    res.status(200).json(user);
});

router.post('/followOrUnfollow/:id',
    checkAuth,
    async (req, res) => {
    const {id: otherUserId} = req.params;

    const currentUser = await User.findById(req.user.userId);
    const otherUser = await User.findById(otherUserId);

    if (currentUser.following.map(x => x.toString()).includes(otherUserId)) {
        currentUser.following = currentUser.following.filter(x => x.toString() !== otherUserId);
        await currentUser.save();
        otherUser.followers = otherUser.followers.filter(x => x.toString() !== req.user.userId);
        await otherUser.save();
        res.status(200).json({message: 'unfollowed'});
    } else {
        currentUser.following.push(otherUserId);
        await currentUser.save();
        otherUser.followers.push(req.user.userId);
        await otherUser.save();
        res.status(200).json({message: 'followed'});
    }
});

module.exports = router;
