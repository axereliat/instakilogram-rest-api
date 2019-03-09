const mongoose = require('mongoose');

module.exports = () => {
    const username = 'mario';
    const password = 'godofwar123';
    mongoose.connect(`mongodb://${username}:${password}@ds163835.mlab.com:63835/instakilogram`, {
        useNewUrlParser: true
    })
};
