var db = require('../../config/database.config.js');
var count = 0;

exports.aggregateTo = (req, res) => {
    var exchange = req.query.exchange;
    var base = req.query.base;
    var quote = req.query.quote;
    var timeFrom = req.query.timeFrom;
    var resolutionTo = req.query.resolutionTo;

    console.log(exchange + "-" + base + "-" + quote + "-" + timeFrom + "-" + resolutionTo);

    // (Optipon)timeFrom 以timeFrom開始計算, 若是此range(1m)無資料, 則停止
    // 1. 找此 resolution 下一筆資料之起始時間, 若：
    //      a. 無資料: 找1m第一個此resolution的起始時間
    //         prev = 1330518155 - (1330518155 % 1800);
    //         next = $prev + 1800;
    // 2. 

    res.send({"test": "aggregateTo"});
}