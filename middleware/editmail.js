const{ pool } = require('../models/db');

module.exports = function (req, res, next) {
 
    pool.query(`select email from public.register`,(err,result)=>{
        let udata=result.rows;
        var u_mail= udata.find((u)=>u.email==req.body.iemail);
        if(u_mail){
            return  res.render('invite',{msg: 'This Email is already registered!!!'}); 
        }
        else{
            pool.query(`select child from public.invited`,(err,result)=>{
                let udata=result.rows;
                var u_mail= udata.find((u)=>u.child==req.body.iemail);
                if(u_mail){
                    return  res.render('invite',{msg: 'This Email is already invited!!!'}); 
                }
                else{
                    next();
                } 
            });
        } 
      });
   
}

