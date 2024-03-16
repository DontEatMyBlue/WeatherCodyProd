const mysql = require('mysql2');

const pool = mysql.createPool({
    connectionLimit:10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

exports.getConnection = (callback)=>{
    pool.getConnection((err,connection)=>{
        if(err){
            return callback(err);
        }
        callback(null,connection);
    });
};