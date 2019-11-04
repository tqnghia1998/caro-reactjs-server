const passport = require('passport');
const passportJWT = require("passport-jwt");
const bcrypt = require('bcrypt');
const userModel = require('../models/users.model');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const configAuth = require('../utils/facebook');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : 'nghiatq_jwt_secretkey'
    },
    (jwtPayload, done) => {

        // find the others information of user in database if needed
        return userModel.get(jwtPayload.username).then(user => {
            return done(null, user);
        }).catch(err => {
            return done(err);
        });
    }
));

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, 
    (username, password, done) => {
        userModel.get(username).then(rows => {
            if (rows.length === 0) {
                return done(null, false, {
                    message: 'Tài khoản không tồn tại'
                });
            }
            var user = rows[0];

            // compare password
            var ret = bcrypt.compareSync(password, user.password);
            if (ret) {
                
                // for security, send only username
                return done(null, {
                    username: user.username
                });
            }
            else {
                return done(null, false, {
                    message: 'Mật khẩu không chính xác'
                })
            }
        }).catch(err => {
            return done(err, false);
        })
    }
));

passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: ['id','displayName','email','first_name','last_name','middle_name']
},
    // facebook will send user token and profile information
    function (token, refreshToken, profile, done) {
    
    // this is asynchronous
    process.nextTick(function () {

        // look up into database to see if it already has this user
        userModel.get(profile.id).then(rows => {

            // if account exists, just return it
            if (rows.length > 0) {
                return done(null, {
                    username: rows[0].username
                });
            }
            
            // if it doesn't have any, create one
            var entity = {
                username: profile.id,
                password: token,
                email: profile.emails[0].value,
                fullname: profile.displayName
            }

            // add to database
            userModel.add(entity).then(id => {
                return done(null, {
                    username: entity.username
                });
            }).catch(err => {
                console.log("Error when add facebook user: ", err);
                return done(null, false);
            });

        }).catch(err => {
            if (err) {
                console.log("Error when get user by facebook id: ", err);
                return done(null, false);
            }
        });
    });
}))