var mysql = require('mysql');

module.exports = {
    getConnection: function () {
      var conn = mysql.createConnection({
        host     : '127.0.0.1',
        user     : 'charting',
        password : 'cloudEx88',
        database : 'charting'
      });
      return conn;
    }
};