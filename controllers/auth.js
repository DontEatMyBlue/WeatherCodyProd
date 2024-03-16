const bcrypt = require('bcrypt');
const passport = require('passport');
const mysqlPool = require('../database/mysql_pool');

exports.join = (req,res,next)=>{
    const {id,name,password,age,gender} = req.body;
    try{
        mysqlPool.getConnection((err,connection)=>{
            connection.query('select * from user where id = ?',id,async(error,results)=>{
                const exUser = results[0];
                if(exUser){
                    return res.redirect('/join?error=exist');
                }
                const hash = await bcrypt.hash(password, 12);
                connection.query('insert into user (id,name,password,age,gender) values (?,?,?,?,?)',[id,name,hash,age,gender],(err,rows,fields)=>{
                    return res.redirect('/main');
                })
            })
            
            connection.release();
        })
    }catch(error){
        console.log(error);
        return next(error);
    }
}

exports.login = (req,res,next)=>{
    passport.authenticate('local',(authError,user,info)=>{
        if(authError){
            console.log(authError);
            return next(authError);
        }
        if(!user){
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user,(loginError)=>{
            if(loginError){
                console.log(loginError);
                return next(loginError);
            }
            return res.redirect('/main');
        })
    })(req,res,next)
};

exports.logout=(req,res)=>{
    req.logout(()=>{
        res.redirect('/main');
    });
};