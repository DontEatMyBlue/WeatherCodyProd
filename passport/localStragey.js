const passport = require('passport');
const LocalStragey = require('passport-local');
const mysqlPool = require('../database/mysql_pool');
const bcrypt = require('bcrypt');

module.exports = () =>{
    passport.use(new LocalStragey({
        usernameField : 'id',
        passwordField : 'password',
        passReqToCallback : false
    }, async(id,password,done)=>{
        try{
            mysqlPool.getConnection((err,connection)=>{
                connection.query('select * from user where id = ?',id,async(error,results)=>{
                    connection.release();
                    const exUser = results[0];
                    if(exUser){
                        const result = await bcrypt.compare(password,exUser.password);
                        if(result){
                            done(null,exUser);
                        }else{
                            done(null,false,{message:'비밀번호가 일치하지 않습니다.'});
                        }
                    }
                    else{
                        done(null,false,{message:'가입되지 않은 회원입니다.'})
                    }
                })
            })
        }
        catch(error){
            console.log(error);
            done(error);
        }
    }))
}