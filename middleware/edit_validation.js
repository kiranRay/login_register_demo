const Joi = require('joi');
module.exports=function (req,res,next) {
    const schema = {
        va: Joi.string().required().email()
    };
    const validation= Joi.validate(req.body, schema);
    if(validation.error){
    res.render('invite',{mail:req.session.user.email,error : validation.error});
    }
    else{
        next();
    }
}
