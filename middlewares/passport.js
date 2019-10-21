const passport = require('passport');
const passportJWT = require("passport-jwt");
const bcrypt = require('bcrypt');

const userModel = require('../models/users.model');

const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : 'nghiatq_jwt_secretkey'
    },
    (jwtPayload, done) => {

        // find the others information of user in database if needed
        return userModel.get(jwtPayload.username).then(user => {
            return done(null, user);
        }).catch(err => {
            return done(null, false, {
                message: err
            });
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