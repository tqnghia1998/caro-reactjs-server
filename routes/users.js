/* created by nghiatq on 12-10-2019 */

var express = require('express');
var userModel = require('../models/users.model');
var passport = require('passport');
var bcrypt = require('bcrypt');
var router = express.Router();

// test loading database
router.get('/', (req, res, next) => {
    userModel.all().then(rows => {
        res.send("Connect database successful.");
    }).catch(err => {
        res.send("Connect database fail.");
    });
});

// register a new user
router.post('/register', (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var fullname = req.body.fullname;

    // check params
    if (!username || !password || !email || !fullname) {
        res.send("Please input all fields.");
    }
    else {
        // hash password
        var saltRounds = 10;
        var hash = bcrypt.hashSync(password, saltRounds);

        // create an entity
        var entity = {
            username: username,
            password: hash,
            email: email,
            fullname: fullname
        }

        // add to database
        userModel.add(entity).then(id => {
            res.send("Register success.");
        }).catch(err => {
            res.send("Error: " + err);
        })
    }

})

module.exports = router;
