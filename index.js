const parser = require('body-parser');
const{ pool } = require('./models/db');
var session = require('express-session');
const express=require('express');
const app = new express();
const register = require('./routes/register');

const facebook = require('./routes/facebook');

const users = require('./routes/users');
app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())
app.use(function(req,res,next){
    res.locals.error = null;
    res.locals.msg = null;
    next();
})
app.use(express.json());
app.use(session({secret: "Your secret key", resave: false,
saveUninitialized: true}));
app.set('view engine', 'ejs');
app.set('view engine', 'ejs');
app.set('views','./views');

app.use('/app',register);
app.use('/app/facebook',facebook);
app.use('/app/users',users);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));
///------
--------------