const express=require('express');
const Joi = require('joi');
const md5 = require('md5');
const {validate}=require('../models/validation');
const reg = require('../middleware/reg');
const invite = require('../middleware/invite');
//const editmail = require('../middleware/editmail');
const checkAuth = require('../middleware/session');
const invite_validation = require('../middleware/invite_validation');
//const edit_validation = require('../middleware/edit_validation');
const router = new express.Router();
const{ pool } = require('../models/db');

router.get('/register',(req,res)=>{
    res.render('register');    
});
router.get('/inviteddata',(req,res)=>{
    pool.query(`select child from public.invited where parent='${req.session.user.id}'`,(err,result)=>{
        res.send(result.rows);
    });    
});
router.get('/parentinvited',(req,res)=>{
    pool.query(`select child from public.invited where parent='${req.session.user.parent}'`,(err,result)=>{
        res.send(result.rows);
    });    
});
router.get('/login',(req,res)=>{
    res.render('login');    
});
router.get('/invite',checkAuth,(req,res)=>{
    res.render('invite',{mail: req.session.user.email});    
});
router.get('/home',checkAuth,(req,res)=>{
   // console.log(req.session);
    res.render('home',{mail: req.session.user.email});
});
router.get('/invitehome',checkAuth,(req,res)=>{
    // console.log(req.session);
     res.render('invite_home',{mail: req.session.user.email});
 });
router.get('/logout',(req, res)=>{
    req.session.destroy(function(){
       console.log("user logged out.")
    });
    res.redirect('login');
 });
 

router.post('/register',reg,(req,res)=>{
      
      const { error } = validate(req.body); 
        if (error) {
            res.render('register',{error : error}); 
        } 
        else{
            pool.query(`select * from public.invited`,(err,result)=>{
                let udata=result.rows;
                var u_mail= udata.find((u)=>u.child==req.body.email);
                if(u_mail){
                     let pid= u_mail.parent;
                     var en_pass=md5(req.body.pass);
                     pool.query(`insert into public.register(name,email,dob,gendar,number,pass)values('${req.body.name}','${req.body.email}','${req.body.dob}','${req.body.gendar}','${req.body.num}','${en_pass}')`,()=>{
                         pool.query(`UPDATE public.register SET parent = ${pid}  WHERE email='${req.body.email}'`,()=>{
                            pool.query(`delete from public.invited where child='${req.body.email}'`,()=>{
                                res.redirect('login');
                            })
                         })
                        
                     });
                        
                }
                else{
                    var en_pass=md5(req.body.pass);
                    pool.query(`insert into public.register(name,email,dob,gendar,number,pass)values('${req.body.name}','${req.body.email}','${req.body.dob}','${req.body.gendar}','${req.body.num}','${en_pass}')`);
                    res.redirect('login');
                } 
              });
            
         
        }
});

router.post('/login',(req,res)=>{
    const schema = {
        email: Joi.string().required().email(),
        pass:Joi.string().required()
    };
  const validation= Joi.validate(req.body, schema);
  if(validation.error){
        res.render('login',{error : validation.error});
    }
  else{
        pool.query(`select * from public.register where email='${req.body.email}'`,(err,result)=>{
            if(err) {console.log(err.message);}
            let udata=result.rows;
            var u_mail= udata.find((u)=>u.email==req.body.email);
            if(!u_mail) return  res.render('login',{msg :'Invalid Mail or Password' });
            var d_pass=md5(req.body.pass);
            var u_pass= udata.find((u)=>u.pass==d_pass);
            if(!u_pass) return res.render('login',{msg :'Invalid Mail or Password' });
            req.session.user = u_mail;
            if(req.session.user.parent!=0){
                res.redirect('invitehome');
            }else{
                res.redirect('home');
            }
             
           
        });
        
    }
});

router.post('/invite',[invite_validation,invite],(req,res)=>{
    pool.query(`select invites,used_invites from public.register where id='${req.session.user.id}'`,(err,result)=>{
        if(err) {console.log(err.message);}
        let inv=result.rows;
       // var u_pinvite=inv.find((ui)=>{return ui.pending_invites});
        var u_usedinvite=inv.find((ui)=>{return ui.used_invites});
        var u_invite=inv.find((ui)=>{return ui.invites});
        
        if(u_invite.invites>0 &&  u_usedinvite.used_invites<3){
            pool.query(`UPDATE public.register SET used_invites = used_invites + 1 WHERE id='${req.session.user.id}'`,(err,resu)=>{
                    pool.query(`insert into public.invited(parent,child)values('${req.session.user.id}','${req.body.iemail}')`,(e,r)=>{
                        res.render('invite',{mail:req.session.user.email,msg:'Invite Successfull'});
                    }); 
            }); 
        }
        else{
            res.render('invite',{mail:req.session.user.email,msg:'More than 3 invite not allow'});
            
        }
       
    });
    
});

router.get('/editform',(req,res)=>{
    console.log("call");
   
   // let mailid= req.query.useremail;
    pool.query(`select id,child from public.invited where child='${req.query.useremail}'`,(err,result)=>{
        let id=result.rows.find((i)=>{return i.id});
        console.log("call in query..");
       res.render('edit',{data:req.query.useremail,id:id.id});
    
    });
})
router.post('/edit',(req,res)=>{
    console.log("inn eee..");
    pool.query(`select email from public.register`,(err,result)=>{
        let udata=result.rows;
        var u_mail= udata.find((u)=>u.email==req.body.va);
        if(u_mail){
            return  res.render('edit',{id:req.body.id,data:'',msg: 'This Email is already registered!!!'}); 
        }
        else{
            pool.query(`select child from public.invited`,(err,result)=>{
                let udata=result.rows;
                var u_mail= udata.find((u)=>u.child==req.body.va);
                if(u_mail){
                    return  res.render('edit',{id:req.body.id,data:'',msg: 'This Email is already invited!!!'}); 
                }
                else{
                    console.log('inner ediut.......');
                    pool.query(`UPDATE public.invited SET child ='${req.body.va}'WHERE id=${req.body.id}`,(er,rs)=>{
                        console.log('data calll....');
                        res.render('invite',{mail:req.session.user.email,msg: 'Updated..!!!'});  
                        })
                } 
            });
        } 
      });
    
   
});

router.get('/delete',(req,res)=>{
    pool.query(`delete from public.invited where child='${req.query.useremail}'`,(err,result)=>{
            pool.query(`UPDATE public.register SET used_invites = used_invites-1 WHERE id='${req.session.user.id}'`,()=>{
                res.render('invite',{mail:req.session.user.email});
            })
        
    });
   
})

module.exports =router;