const passport = require('passport');
require('../config/passport')(passport);
const auth          = require('../middleware/auth');
const transporter   = require('../startup/email'); // For sending email
const bcrypt        = require('bcrypt');
const validate      = require('../middleware/validate'); // Validate the request
const { User, validateUser, validateUserOtp, validateLogin, validateResetEmail, validateResetEmail_CheckOtp, validateResetPassword } = require('../models/user');
const { Activitylog } = require('../models/activitylog');
const ip = require('ip');
const express   = require('express');
const router    = express.Router();

/*****  Extra Route to test authentication ****/
router.get('/get', async(req, res) => {
    // if(!req.user.verified) return res.status(400).send('Please verify your email first');
    const user = await User.findOne({});
    user.activityLogStatus(req, 'Register');
    // res.send(JSON.stringify(req));
});

router.post('/signup', [validate(validateUser)], async(req, res) => {
    const postData = req.body;
    let user = await User.findOne({ email: postData.email });
    if(user) return res.status(400).send('User already registered');

    const firstname = postData.firstname;
    const lastname = postData.lastname;
    const email = postData.email;
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(postData.password, salt);
    const otp = Math.floor(100000 + Math.random() * 900000);

    user = new User({
        firstname,
        lastname,
        email,
        password,
        otp
    });
    await user.save();

    user.activityLogStatus(req, 'Registered');

    /* Send mail */
    const mailOptions = {
        from: 'zankhudhamecha@gmail.com',
        to: user.email,
        subject: 'Email verification',
        text: 'Enter below code to verify your email\n' + otp,
    };
    
    await transporter.sendMail(mailOptions);
    
    const token = user.generateAuthToken();
    res.set('x-auth-token', token).send('Please....Verify your Email first :)');
});

router.post('/verify', [auth, validate(validateUserOtp)], async(req, res) => {
    let user = await User.findOne({ _id: req.user._id });
    if(!user) return res.status(400).send('User not found');

    // console.log(req.body.otp); // otp enter by user
    // console.log(user.otp);     // otp stored in db
    if(req.body.otp == user.otp) {
        user.otp = undefined;
        user.verified = true;
        await user.save();
        user.activityLogStatus(req, 'Email Verified');
        res.send('your email is verified');
    }
    else {
        res.status(400).send('Please, enter valid otp..!!');
    }

});

router.post('/signin', validate(validateLogin) , async(req, res) => {

    let user = await User.findOne({ email: req.body.email });
    if(!user) return res.status(400).send('User Not Found...');

    if(!user.verified) return res.status(400).send('Please verify your email first');

    const valid = await bcrypt.compare(req.body.password, user.password);
    if(!valid) return res.status(400).send('Email or Password is wrong');

    const token = user.generateAuthToken();
    user.activityLogStatus(req, 'Login');
    res.header('x-auth-token', token).send('Login successfully..!!');
});

router.post('/resetpassword', validate(validateResetEmail), async(req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if(!user) return res.status(400).send('User Not Found...');

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    await user.save();
    user.activityLogStatus(req, 'PasswordReset Requested');

    /* Send mail */
    const mailOptions = {
        from: 'zankhudhamecha@gmail.com',
        to: user.email,
        subject: 'Reset Password',
        text: 'Enter below code to Reset your password\n' + otp,
    };
      
    await transporter.sendMail(mailOptions);

    const token = user.generateResetToken()
    res.set('x-auth-token', token).send();
});

router.post('/resetpassword_checkotp', [ auth, validate(validateResetEmail_CheckOtp)], async(req, res) => {
    let user = await User.findOne({ _id: req.user._id });
    if(!user) return res.status(400).send('User Not Found...');

    if(req.body.otp === user.otp) {
        const token = user.generateResetTokenVerified();
        res.set('x-auth-token', token).send();
    }
    else{
        res.status(400).send('Please, enter valid otp..!!');
    }
});

router.post('/resetpassword_changepassword', [auth, validate(validateResetPassword)],async(req, res) => {
    let user = await User.findOne({ _id: req.user._id });
    if(!user) return res.status(400).send('User Not Found...');

    if(req.body.password === req.body.confirm_password) {
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(req.body.password, salt);
        user.password = password;
        await user.save();
        user.activityLogStatus(req, 'PasswordReset');
        res.send('Password changed successfully..Login again!!:)');
    } else{
        res.status(400).send('Password doesnot match....');
    }
});

/*********************************************************/
// route for home page
router.get('/', function(req, res) {
    res.render('index.ejs');
});

router.get('/profile',isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
        user : req.user 
    });
});

router.get('/logout', function(req, res) {
    req.session.destroy();
    req.logout();
    res.redirect('/api/users/');
});

router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect : '/api/users/profile',
        failureRedirect : '/api/users/'
    })
);

function isLoggedIn(req, res, next) {
    
   if (req.isAuthenticated()){
        return next();
    }
    res.status(400).send({success: false, message : "Session Expired"});
    // res.redirect('/api/users/get');
}

// router.get('/kiran', function() {
//     console.log('testkiran');
// });

module.exports = router;
