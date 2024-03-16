const mysqlPool = require('../database/mysql_pool');

exports.tempCody = (req,res,next)=>{
    const max = 15;
    const min = 12;
    mysqlPool.getConnection((err,connection)=>{
        if(err){
            return res.status(500).json({error:'DB연동 문제 발생'});
        }
        connection.query('select title,img1 from post where temp between ? and ?',[min,max],(error,results)=>{
            connection.release();
            if(err){
                console.log(err);
            }
            console.log(results);
            res.render("temppost",results);
        });
    })
}