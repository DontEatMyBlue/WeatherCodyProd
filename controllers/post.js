const mysqlPool = require('../database/mysql_pool');

exports.postWrite = (req,res,next)=>{
    let img1 = null;
    let img2 = null;
    let img3 = null;

    if (req.files.image1 && req.files.image1.length > 0) {
        img1 = req.files.image1[0].filename;
    }
    if (req.files.image2 && req.files.image2.length > 0) {
        img2 = req.files.image2[0].filename;
    }
    if (req.files.image3 && req.files.image3.length > 0) {
        img3 = req.files.image3[0].filename;
    }

    const {title,content,temp,height,weight,gender} = req.body;
    const params = [req.user.id,title,content,temp,height,weight,gender,img1,img2,img3];
    mysqlPool.getConnection((err,connection)=>{
        if(err){
            return res.status(500).json({error:'DB연동 문제 발생'})
        }
        connection.query('insert into post(id,title,content,temp,height,weight,gender,img1,img2,img3) values (?,?,?,?,?,?,?,?,?,?)',params,(err,rows,fileds)=>{
            connection.release();
            if(err){
                console.log(err);
            }
            console.log(rows);
            res.redirect('/main');
        })
    })
}

exports.postEdit = (req,res,next)=>{
    let img1 = null;
    let img2 = null;
    let img3 = null;
    const postnum = req.params.postnum;
    let sql = 'Update post set title=?,content=?,temp=?,height=?,weight=?,gender=?';
    const {title,content,temp,height,weight,gender} = req.body;
    const params = [title,content,temp,height,weight,gender]


    if (req.files.image1 && req.files.image1.length > 0) {
        img1 = req.files.image1[0].filename;
        sql+=',img1=?'
        params.push(img1);
    }
    if (req.files.image2 && req.files.image2.length > 0) {
        img2 = req.files.image2[0].filename;
        sql+=',img2=?'
        params.push(img2);
    }
    if (req.files.image3 && req.files.image3.length > 0) {
        img3 = req.files.image3[0].filename;
        sql=',img3=?'
        params.push(img3);
    }
    sql+='where postnum =?'
    params.push(postnum);
    mysqlPool.getConnection((err,connection)=>{
        if(err){
            return res.status(500).json({error:'DB연동 문제 발생'})
        }
        connection.query(sql,params,(err,results)=>{
            connection.release();
            if(err){
                console.log(err);
            }
            console.log(results);
            res.redirect(`../../detailpost/${postnum}`);
        })
    })
}

exports.postDelete = (req,res,next)=>{
    const postnum = req.params.postnum;
    const sql = 'delete from post where postnum = ?'
       mysqlPool.getConnection((err,connection)=>{
        if(err){
            return res.status(500).json({error:'DB연동 문제 발생'})
        }
        connection.query(sql,postnum,(err,results)=>{
            connection.release();
            if(err){
                console.log(err);
            }
            console.log(results);
            res.redirect('../../main');
        })
    })
}