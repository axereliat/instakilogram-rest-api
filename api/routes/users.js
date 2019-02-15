'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');

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
                        roles
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

module.exports = router;
