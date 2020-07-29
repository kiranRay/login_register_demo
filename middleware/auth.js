const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).send('Please provide token');

    try{
        const decoded = jwt.verify(token, 'jwtPrivateKey');
        req.user = decoded;

        if(req.url !== '/verify' && req.url !== '/resetpassword_checkotp' && req.url !== '/resetpassword_changepassword') { if(!req.user.verified) return res.status(400).send('Please verify your email first'); }

        if(req.url == '/resetpassword_changepassword') {
            if(!req.user.otp_verified) return res.status(400).send('Please verify otp first!!');
        }

        next();
    
    } catch(ex) {
        res.status(400).send('Invalid Token');
    }    
}