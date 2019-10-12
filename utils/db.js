var mysql = require('mysql');

var createConnection = () => {
    return mysql.createConnection({
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: 'admin',
        database: 'web-btcn06-1612422'
    });
}
module.exports = {
    load: sql => {
        return new Promise((resolve, reject) => {
            var connection = createConnection();
            connection.connect();
            connection.query(sql, (error, results, fields) => {
                if (error)
                    reject(error);
                else {
                    resolve(results);
                }
                connection.end();
            });
        });
    },

    add: (tablename, entity) => {
        return new Promise((resolve, reject) => {
            var sql = `insert into ${tablename} set ?`;
            var connection = createConnection();
            connection.connect();
            connection.query(sql, entity, (error, value) => {
                if (error)
                    reject(error);
                else {
                    resolve(value.insertId);
                }
                connection.end();
            });
        });
    },

    update: (tablename, idField, entity) => {
        return new Promise((resolve, reject) => {
            var id = entity[idField];
            delete entity[idField];
            var sql = `update ${tablename} set ? where ${idField} = ?`;
            var connection = createConnection();
            connection.connect();
            connection.query(sql, [entity, id], (error, value) => {
                if (error)
                    reject(error);
                else {
                    resolve(value.changeRows);
                }
                connection.end();
            });
        });
    },

    delete: (tablename, idField, id) => {
        return new Promise((resolve, reject) => {
            var sql = `delete from ${tablename} where ${idField} = ?`;
            var connection = createConnection();
            connection.connect();
            connection.query(sql, id, (error, value) => {
                if (error)
                    reject(error);
                else {
                    resolve(value.affectedRows);
                }
                connection.end();
            });
        });
    },
};