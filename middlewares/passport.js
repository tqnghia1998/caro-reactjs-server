const passport = require('passport');
const userModel = require('../models/users.model');
const bcrypt = require('bcrypt');

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, 
    function (username, password, done) {
        userModel.get(username).then(rows => {
            if (rows.length === 0) {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
            var user = rows[0];

            // compare password
            var ret = bcrypt.compareSync(password, user.password);
            if (ret) {
                return done(null, user);
            }
            else {
                return done(null, false, {
                    message: 'Incorrect password.'
                })
            }
        }).catch(err => {
            return done(err, false);
        })
    }
));