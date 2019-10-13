var db = require('../utils/db');
var bcrypt = require('bcrypt');

module.exports = {

    all: () => {
        return db.load(`select * from users`);
    },

    add: entity => {
        return db.add(`users`, entity);
    },

    get: username => {
        return db.load(`select * from users where username = '${username}'`);
    }
}