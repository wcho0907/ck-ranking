var mysql = require('mysql');

var pool;

module.exports = {
    getPool: function () {
      if (pool) return pool;
      pool = mysql.createPool({
        host     : '127.0.0.1',
        user     : 'charting',
        password : 'cloudEx88',
        database : 'charting'
      });
      return pool;
    }
};

// module.exports = {
//     url: 'mongodb://localhost:27017/easy-notes'
// }

