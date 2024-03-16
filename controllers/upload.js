const multer = require('multer');

exports.upload = multer({
    storage: multer.diskStorage({
        destination: function(req,file,done){
            done(null,"uploads/");
        },
        filename: function(req,file,done){
            done(null,Date.now() + "_" + file.originalname);
        },
        limits: { fileSize: 5 * 1024 * 1024 }
    })
});

