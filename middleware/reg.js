const{ pool } = require('../models/db');

module.exports = function (req, res, next) {
    pool.query(`select email from public.register`,(err,result)=>{
        let udata=result.rows;
        var u_mail= udata.find((u)=>u.email==req.body.email);
        if(u_mail){
            return  res.render('register',{msg: 'This Email is already registered!!!'}); 
        }
        else if(req.body.pass===req.body.conpass){
            next();
        } else{
            return  res.render('register',{msg: 'Password and ConfirmPassword not match'}); 
        }
      });
}

