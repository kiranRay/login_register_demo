
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var { User } = require('../models/user');
var configAuth = require('./auth');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({
        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
    },(token, refreshToken, profile, done) => {
        // User.findOne fire after all our data back from Google
        process.nextTick(async() =>  {
            
            const user = await User.findOne({ 'google.id' : profile.id });

            if (user) { 
                return done(null, user);
            } else { 
                var newUser = new User();
                
                newUser.google.id    = profile.id;
                newUser.google.token = token;
                newUser.google.name  = profile.displayName;
                newUser.google.email = profile.emails[0].value; 
                newUser.google.profile = profile.photos[0].value;
                newUser.provider   = profile.provider;
                
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }
        });
    })); /* end login with google */

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields: ['emails', 'name']
    },(token, refreshToken, profile, done) => {
        
        process.nextTick(async() =>  {
            const user = await User.findOne({ 'facebook.id' : profile.id });
         
            if (user) { 
                return done(null, user);
            } else { 
                var newUser = new User();
                
                newUser.facebook.id         = profile.id;
                newUser.facebook.token      = token;
                newUser.facebook.name       = profile.name.givenName;
                newUser.facebook.email      = profile.emails[0].value; 
                newUser.provider            = profile.provider;
                
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }
        });
        
    })); /* end login with facebook */

};