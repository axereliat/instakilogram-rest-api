const cloudinary = require('cloudinary');
const Busboy = require('busboy');

const uploadToCloudinary = file => (
    new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(data => {
            resolve(data);
        })
            .end(file.data)
    })
);

module.exports = (filename, mimeTypes) => (
    (req, res, next) => {
        req.body.files = [];
        if (!req.files ||
            !req.files[filename]) {
            return next()
        }

        for (const file of req.files[filename]) {
            // validation
            const mimetype = file.mimetype;
            if (mimeTypes.indexOf(mimetype) === -1) {
                return res.status(400).json({
                    message: 'Only the following formats are supported: ' + mimeTypes.join(', ')
                }).end();
            }
        }
        res.setTimeout(0);

        const busboy = new Busboy({headers: req.headers});

        busboy.on('finish', function () {
            const numFiles = req.files[filename].length;

            function doUpload(index) {
                if (index === numFiles) {
                    return next();
                }
                uploadToCloudinary(req.files[filename][index])
                    .then(data => {
                        req.body.files.push(data.secure_url);
                        doUpload(++index);
                    })
                    .catch(err => {
                        console.log('Error: ', err);
                        doUpload(++index);
                    })
            }

            doUpload(0);
        });

        req.pipe(busboy)
    }
);
