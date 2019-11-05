var config = require('../config.js');

module.exports = {
    'facebookAuth': {
        'clientID': '2370354149876596',
        'clientSecret': '016af082efd81b61ac5ad0df64171ced',
        'callbackURL': config['server-domain'] + 'users/login/facebook/callback'
    },
    'googleAuth': {
        'clientID': '31060623633-2uqdige41g1vt5figsneok2qq5563nld.apps.googleusercontent.com',
        'clientSecret': 'CJ_7EjT9T5ZqBb3VJm7Jlf-a',
        'callbackURL': config['server-domain'] + 'users/login/google/callback'
    }
};