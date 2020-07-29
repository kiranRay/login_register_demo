
const express=require('express');
const router = new express.Router();
const{ pool } = require('../models/db');

router.get('/',(req,res)=>{
    pool.query('SELECT * FROM public.student',(err,result)=>{
        if(err) console.log(err);
        res.send(result.rows);
    })
   
});

router.get('/display',(req,res)=>{
    res.render('display');    
});
router.get('/insert',(req,res)=>{
    res.render('insert');
});
router.post('/insertedata',(req,res)=>{
    
  pool.query(`INSERT INTO public.student(name)VALUES('${req.body.name}')returning name,id`,(err,result)=>{
    let ins;
         if(err) console.log(err);
            ins=result.rows[0];
            console.log(ins.name);
            pool.query(`INSERT INTO public.student_info(id,name,email)VALUES(${ins.id},'${ins.name}','a@gmail.com')`); 
         });
         
         //
   
   res.render('display');
});

router.get('/update/',(req,res)=>{
    const details={
        id:req.query.id,
        name:req.query.name
    }
   
     console.log(details);
    res.render('update',{id:details.id,name:details.name});    
});

router.post('/updatedata',(req,res)=>{
    pool.query(`UPDATE public.student SET name = '${req.body.name}' where id = ${req.body.id} returning name,id`,(err,result)=>{
        let upd;
        if(err) console.log(err);
            upd=result.rows[0];
            console.log(upd)
            pool.query(`UPDATE public.student_info SET name = '${upd.name}' where id = ${upd.id}`)
    });

       res.render('display');
})

router.get('/delete/',(req,res)=>{
    const details={
        id:req.query.id,
    }
    res.render('delete',{id:details.id});     
});

router.post('/deletedata',(req,res)=>{
    pool.query(`DELETE FROM public.student WHERE id = ${req.body.id} returning id`,(err,result)=>{
        if(err) console.log(err);
          let del;
          del=result.rows[0];
          pool.query(`DELETE FROM public.student_info WHERE id = ${del.id}`)
       });
       res.render('display');
});

module.exports =router;