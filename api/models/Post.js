const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    description: {type: String},
    photos: [{type: String}],
    author: {type: mongoose.Schema.ObjectId, ref: 'User'},
    createdOn: {type: mongoose.Schema.Types.Number, default: (new Date()).getTime()},
    comments: [{type: mongoose.Schema.ObjectId, ref: 'Comment'}],
    likes: [{type: mongoose.Schema.ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Post', postSchema);
