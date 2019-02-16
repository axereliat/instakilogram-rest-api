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
        if (!req.files ||
            !req.files[filename]) {
            return next()
        }

        // validation
        const mimetype = req.files[filename].mimetype;
        if (mimeTypes.indexOf(mimetype) === -1) {
            return res.status(400).json({
                message: 'Only the following formats are supported: ' + mimeTypes.join(', ')
            }).end();
        }

        res.setTimeout(0);

        const busboy = new Busboy({headers: req.headers});

        busboy.on('finish', function () {
            const file = req.files[filename];

            uploadToCloudinary(file)
                .then(data => {

                    req.body[filename + 'Url'] = data.secure_url;
                    next()
                })
                .catch(err => {
                    console.log('Error: ', err);
                    next()
                })
        });

        req.pipe(busboy)
    }
)
