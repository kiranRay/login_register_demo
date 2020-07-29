const Joi = require('joi');
function validateUser(user) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        dob:Joi.date().required(),
        gendar:Joi.required(),
        num:Joi.string().min(10).max(10).required(),
        pass:Joi.string().min(8).required(),
       conpass:Joi.string().min(8).required()
    };
    return Joi.validate(user, schema);
  }
  
  
  exports.validate = validateUser;