const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');
const cors = require('cors');

dotenv.config();
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const weatherRouter = require('./weatherapi/weather')
const passportConfig = require('./passport');

const app = express();
passportConfig();
app.set('port',process.env.PORT || 8001);
app.set('view engine', 'html');
nunjucks.configure('views',{
    express:app,
    watch: true,
});

app.use(cors({
    origin: 'http://weathercody-env-1.eba-vjumvjna.ap-northeast-2.elasticbeanstalk.com/', // 클라이언트의 실제 도메인으로 변경
    credentials: true
  }));


app.use(morgan('dev'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'uploads')));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave:false,
    saveUninitialized:false,
    secret: process.env.COOKIE_SECRET,
    cookie:{
        httpOnly:true,
        secure:false
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/',weatherRouter);
app.use('/',pageRouter);
app.use('/auth',authRouter);
app.use('/post',postRouter);

app.get('/favicon.ico', (req, res) => res.status(204));
app.use((req,res,next)=>{
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    res.send("페이지를 찾지 못했습니다 404");
});

app.use((err,req,res,next)=>{
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err:{};
    res.status(err.status||500);
    res.render('error');
    console.log(err);
});

app.listen(app.get('port'),()=>{
    console.log(app.get('port'),'번 포트에서 대기 중');
});
