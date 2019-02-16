const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    content: {type: mongoose.Schema.Types.String, required: true},
    author: {type: mongoose.Schema.ObjectId, ref: 'User'},
    createdOn: {type: mongoose.Schema.Types.Number, default: (new Date()).getTime()}
});

module.exports = mongoose.model('Comment', commentSchema);
