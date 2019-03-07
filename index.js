const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const usersRoute = require('./api/routes/users');
const postsRoute = require('./api/routes/posts');
const mongodbConfig = require('./config/mongodb-config');
const cloudinaryConfig = require('./config/cloudinary-config');

const app = express();
const port = process.env.PORT || 8000;

mongodbConfig();

cloudinaryConfig();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(fileUpload());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'POST, PUT, PATCH, DELETE, GET');
        res.status(200).json({});
    }

    next();
});


app.use('/users', usersRoute);
app.use('/posts', postsRoute);

app.listen(port, () => console.log(`Listening on port ${port}!`));
