const mysqlPool = require('../database/mysql_pool');
const nunjucks = require('nunjucks');
const { getValue, setValue, keyExists } = require('../database/redis');

exports.renderMain = (req, res, next) => {
    let max;
    let min; 
    let paramMax;
    let paramMin;
    let currentTemp = req.cookies.currentTemp;
    let location = req.cookies.location;
    let weather = req.cookies.weather;
    //현재 기온에 따른 게시판 구간값을 max와 min에 저장
    if (currentTemp >= 28) {
        max = 'high';
    } else if (currentTemp >= 23) {
        max = 27;
        min = 23;
    } else if (currentTemp >= 20) {
        max = 22;
        min = 20;
    } else if (currentTemp >= 17) {
        max = 19;
        min = 17;
    } else if (currentTemp >= 12) {
        max = 16;
        min = 12;
    } else if (currentTemp >= 9) {
        max = 11;
        min = 9;
    } else if (currentTemp >= 5) {
        max = 8;
        min = 5;
    } else {
        min = 'low';
    }
    mysqlPool.getConnection(async(err, connection) => {
        if (err) {
            return res.status(500).json({ error: 'DB연동 문제 발생' });
        }
        if (req.params.temp) {
            //high 게시판일 경우 만약에 high라는 레디스 키 값(페이지 캐싱)을 가져온다
            if (req.params.temp == 'high') {
                const exist = await keyExists('high');
               if(exist){
                const value= await getValue('high');
                res.send(value);
               }
               //만약에 레디스의 키 값이 없을 경우
               else{
                connection.query(
                    'select title,img1,postnum from post where temp >= 28',
                    (error, results) => {
                        connection.release();
                        if (err) {
                            console.log(err);
                        }
                        //현재의 기온이 high 게시판의 기온과 같다면 레디스 페이지 캐시 저장
                        if(max=='high'){
                            console.log("여기 실행")
                            const html = nunjucks.render('sub.html',{
                                LoggedIn: req.isAuthenticated(),
                                results: results,
                            })
                            setValue('high',3600,html);
                            res.send(html);
                        }
                        else{
                        //현재 기온과 다르다면 일반적인 render
                        res.render('sub', {
                            LoggedIn: req.isAuthenticated(),
                            results: results,
                        });
                    }
                    },
                );
               }
            } else if (req.params.temp == 'low') {
                const exist = await keyExists('low');
               if(exist){
                const value= await getValue('low');
                res.send(value);
                console.log('low레디스');
               }
               else{
                connection.query(
                    'select title,img1,postnum from post where temp <= 4',
                    (error, results) => {
                        connection.release();
                        if (err) {
                            console.log(err);
                        }
                        if(min=='low'){
                            const html = nunjucks.render('sub.html',{
                                LoggedIn: req.isAuthenticated(),
                                results: results,
                            })
                            setValue('low',3600,html);
                            res.send(html);
                        }
                        else{
                        res.render('sub', {
                            LoggedIn: req.isAuthenticated(),
                            results: results,
                        });
                    }
                    },
                );
               }
            } else if (
                req.params.temp !== 'high' &&
                req.params.temp !== 'low'
            ) {
                [paramMax, paramMin] = req.params.temp.split('-');
                const exist = await keyExists(req.params.temp);
                if(exist){
                    const value = await getValue(req.params.temp);
                    res.send(value);
                    console.log("실행완료");
                }

                else{
                connection.query(
                    'select title,img1,postnum from post where temp between ? and ?',
                    [paramMin, paramMax],
                    (error, results) => {
                        connection.release();
                        if (err) {
                            console.log(err);
                        } 
                        if(paramMax==max){
                            console.log("여기 실행")
                            const html = nunjucks.render('sub.html',{
                                LoggedIn: req.isAuthenticated(),
                                results: results,
                            });
                      
                            setValue(req.params.temp,3600,html);
                            res.send(html);
                        }
                        else {
                            res.render('sub', {
                            LoggedIn: req.isAuthenticated(),
                            results: results,
                        });
                        }
                    },
                );
                }
            }
        } else {
            //메인페이지
            let testQuery;
            let testParam;
            if (max !== 'high' && min !== 'low') {
                testQuery =
                    'select title,img1,postnum from post where temp between ? and ?';
                testParam = [min, max];
            } else if (max == 'high') {
                testQuery =
                    'select title,img1,postnum from post where temp >= 28';
            } else if (min == 'low') {
                testQuery =
                    'select title,img1,postnum from post where temp <= 4';
            }
            connection.query(testQuery, testParam, (error, results) => {
                connection.release();
                if (err) {
                    console.log(err);
                }   
                const sliceResult = results.slice(0,5);
                console.log(req.isAuthenticated());
                res.render('main', {
                    LoggedIn: req.isAuthenticated(),
                    results: sliceResult,
                    location :location,
                    currentTemp : currentTemp,
                    weather:weather
                });
            });
        }
    });
};

//게시글 상세페이지
exports.renderDetailPost = (req, res, next) => {
    let checkUser;
    const postnum = req.params.postnum;
    mysqlPool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: 'DB연동 문제 발생' });
        }
        connection.query(
            'select * from post where postnum = ?',
            postnum,
            (err, result) => {
                connection.release();
                if (err) {
                    console.log(err);
                }
                //현재 게시글의 작성자가 맞으면 true반환
                if (
                    req.user &&req.user.id == result[0].id
                ) {
                    checkUser = true;
                }

                res.render('detailpost', {
                    result: result[0],
                    checkUser: checkUser,
                });
            },
        );
    });
};

//게시글 수정페이지
exports.renderEdit = (req, res, next) => {
    const postnum = req.params.postnum;
    mysqlPool.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ error: 'DB연동 문제 발생' });
        }
        connection.query(
            'select * from post where postnum = ?',
            postnum,
            (err, result) => {
                connection.release();
                if (err) {
                    console.log(err);
                }
                if (
                    req.user.id== result[0].id
                ) {
                    console.log(result[0].id);
                    res.render('editpost', { result: result[0] });
                }
            },
        );
    });
};
