const passport = require('passport');
const local = require('./localStragey');
const mysqlPool = require('../database/mysql_pool');

module.exports= ()=>{
    passport.serializeUser((user,done)=>{
        done(null,user.id);
    });

    passport.deserializeUser((id,done)=>{
        mysqlPool.getConnection((err,connection)=>{
            connection.query('select * from user where id = ?',id, (error,results)=>{
                connection.release();
                if(error){
                    done(error);
                }
                const user = results[0];
                if (!user) {
                    return done(null, false, { message: '사용자를 찾을 수 없습니다.' });
                }
                return done(null,user);

                
            } )
        })
    });
    
    local();

}