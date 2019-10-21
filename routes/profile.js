/* created by nghiatq on 13-10-2019 */

var express = require('express');
var router = express.Router();

// get infomation
router.get('/me', (req, res, next) => {
    
    // for security, do not send password
    if (req.user.length > 0) {
        const user = req.user[0];
        const info = {
            username: user.username,
            email: user.email,
            fullname: user.fullname
        }
        res.json(info);
    }
});

module.exports = router;