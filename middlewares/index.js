exports.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        res.write("<script>window.location=\"/login\"</script>");
    
    }
};

exports.isNotLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        next();
    }else{
        const message = "로그인한 상태입니다.";
        res.write("<script>window.location=\"/main\"</script>");
    }
};