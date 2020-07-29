
const passport = require('passport');
require('../config/passport')(passport);
const express   = require('express');
const router    = express.Router();

/*** facebook code */
router.get('/', function(req, res) {
    res.render('facebook_index.ejs');
});

router.get('/profile',isLoggedIn, function(req, res) {
    res.render('facebook_profile.ejs', {
        user : req.user 
    });
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/api/facebook/profile',
        failureRedirect : '/api/facebook'
}));

router.get('/logout', function(req, res) {
    req.session.destroy();
    req.logout();
    res.redirect('/api/facebook/');
});

function isLoggedIn(req, res, next) {
    
    if (req.isAuthenticated()){
         return next();
     }
     res.status(400).send({success: false, message : "Session Expired"});
     // res.redirect('/api/users/get');
} 

module.exports = router;

