const mysqlPool = require('../database/mysql_pool');
const nunjucks = require('nunjucks');
const { getValue, setValue, keyExists } = require('../database/redis');
let ttt;
exports.renderMain = (req, res, next) => {
    let max;
    let min; 
    let paramMax;
    let paramMin;
    let currentTemp = req.cookies.currentTemp;
    let location = req.cookies.location;
    let weather = req.cookies.weather;
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
            if (req.params.temp == 'high') {
                const exist = await keyExists('high');
               if(exist){
                const value= await getValue('high');
                res.send(value);
                console.log('high레디스');
               }
               else{
                connection.query(
                    'select title,img1,postnum from post where temp >= 28',
                    (error, results) => {
                        connection.release();
                        if (err) {
                            console.log(err);
                        }
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
