const express = require('express');
const {postWrite,postEdit,postDelete} = require('../controllers/post');
const { upload } = require('../controllers/upload');

const router = express.Router();

router.post('/write', upload.fields([{name:'image1'}, {name:'image2'}, {name:'image3'}]),postWrite);
router.post('/edit/:postnum', upload.fields([{name:'image1'}, {name:'image2'}, {name:'image3'}]),postEdit);
router.get('/delete/:postnum',postDelete);

module.exports = router;