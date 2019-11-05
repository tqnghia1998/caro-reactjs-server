var config = require('../config.js');

module.exports = {
    'facebookAuth': {
        'clientID': '2370354149876596',
        'clientSecret': '016af082efd81b61ac5ad0df64171ced',
        'callbackURL': config['server-domain'] + 'users/login/facebook/callback'
    }
};