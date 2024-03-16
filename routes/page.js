const express = require('express');
const {renderMain, renderDetailPost, renderEdit} = require('../controllers/page');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares');

const router = express.Router();

router.get('/main/:temp',renderMain);
router.get('/main/',renderMain);
router.get('/join',isNotLoggedIn,(req,res)=>{
    res.render('join');
});
router.get('/login',isNotLoggedIn,(req,res)=>{
    res.render('login');
});
router.get('/write',isLoggedIn,(req,res)=>{
    res.render('writepost');
})
router.get('/detailpost/:postnum',renderDetailPost);
router.get('/edit/:postnum',isLoggedIn,renderEdit);

module.exports = router;