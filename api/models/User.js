const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profilePicture: {type: String, default: 'https://res.cloudinary.com/dr8ovbzd2/image/upload/v1534048322/no-user.png'},
    roles: [{type: String}],
    followers: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
    following: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
    posts: [{type: mongoose.Schema.ObjectId, ref: 'Post'}]
});

module.exports = mongoose.model('User', userSchema);
