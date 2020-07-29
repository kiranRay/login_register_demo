const jwt       = require('jsonwebtoken');
const mongoose  = require('mongoose');
const Joi       = require('joi');
const ip        = require('public-ip');
const geoip     = require('geoip-lite');
const { Activitylog } = require('../models/activitylog');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        // required: true,
        minlength: 3,
        maxlength: 50
    },
    lastname: {
        type: String,
        // required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        // required: true,
        minlength: 5,
        maxlength: 50,
    },
    password: {
          type: String,
          require: true,
          minlength: 6,
          maxlength: 255
    },
    otp: {
        type: Number,
        minlength: 6
    },
    verified: {
        type: Boolean,
        default: false
    },
    google: {
        id: String,
        token: String,
        name: String,
        email: String,
        profile: String
    },
    facebook: {
        id: String,
        token: String,
        name: String,
        email: String
    },
    provider: {
        type: String
    }
});

userSchema.methods.generateAuthToken = function() {
    return jwt.sign({ _id:this._id, verified: this.verified }, 'jwtPrivateKey');
}

userSchema.methods.generateResetToken = function() {
    return jwt.sign({ _id: this._id }, 'jwtPrivateKey');
}

userSchema.methods.generateResetTokenVerified = function() {
    return jwt.sign({ _id: this._id, otp_verified: true }, 'jwtPrivateKey');
}

userSchema.methods.activityLogStatus = async function(req, activityLog) {
    const user_id = this._id;
    const activity = activityLog;
    const user_agent = req.useragent.browser + ' ' + req.useragent.version;
    const os = req.useragent.platform + ' | ' + req.useragent.os ;
    const device = req.device.type;
    const user_ip = await ip.v4();  
    const geoipinfo = geoip.lookup(user_ip); 
    const country = geoipinfo.country; 

    activitylog = new Activitylog({
        user_id,
        activity,
        user_agent,
        os,
        device,
        user_ip,
        country
    });
    console.log(activitylog);
    await activitylog.save();
}

const User = mongoose.model('User', userSchema);

function validateUser(user) { 
    const schema = { 
        firstname: Joi.string().min(3).max(50).required(),
        lastname: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(50).required().email(),
        password: Joi.string().min(6).max(255).required()
    }

    return Joi.validate(user, schema);
}
function validateUserOtp(user) { 
    const schema = { 
        otp: Joi.number().min(6).required()
    }

    return Joi.validate(user, schema);
}
function validateLogin(user) { 
    const schema = { 
        email: Joi.string().min(5).max(50).required(),
        password: Joi.string().min(6).required()
    }

    return Joi.validate(user, schema);
}
function validateResetEmail(user) {
    const schema = { 
        email: Joi.string().min(5).max(50).required(),
    }

    return Joi.validate(user, schema); 
}
function validateResetEmail_CheckOtp(user) {
    const schema = { 
        otp: Joi.number().min(6).required(),
    }

    return Joi.validate(user, schema); 
}
function validateResetPassword(user) {
    const schema = { 
        password: Joi.string().min(6).required(),
        confirm_password: Joi.string().min(6).required(),
    }

    return Joi.validate(user, schema); 
}

exports.userSchema = userSchema;
exports.User = User;
exports.validateUser = validateUser;
exports.validateUserOtp = validateUserOtp;
exports.validateLogin = validateLogin;
exports.validateResetEmail = validateResetEmail;
exports.validateResetEmail_CheckOtp = validateResetEmail_CheckOtp;
exports.validateResetPassword = validateResetPassword;
