const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
    region: process.env.AWS_REGION
});

  
const s3 = new aws.S3();

exports.upload = multer({
    storage: multerS3({
        s3:s3,
        bucket:'codyweather',
        acl: 'public-read', 
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '_' + file.originalname)
          }
    })
});

