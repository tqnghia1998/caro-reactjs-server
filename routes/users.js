var express = require('express');
var userModel = require('../models/users.model');
var router = express.Router();

/* nghiatq edited here 12-10-2019 */

router.get('/', (req, res, next) => {

    // test loading database
    userModel.all().then(rows => {
        res.send("Connect database successful.");
    }).catch(err => {
        res.send("Connect database fail.");
    });
    
});

module.exports = router;
