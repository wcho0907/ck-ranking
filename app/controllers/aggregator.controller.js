var db = require('../../config/database.config.js');
var count = 0;

exports.aggregateTo = (req, res) => {
    var exchange = req.query.exchange;
    var base = req.query.base;
    var quote = req.query.quote;
    var resolutionTo = req.query.resolutionTo;
    var timeFrom = req.query.timeFrom;
    var timeTo = req.query.timeTo;

    console.log(exchange + "-" + base + "-" + quote + "-" + resolutionTo + "-" + timeFrom + "-" + timeTo);


    // S0. 如果有timeFrom則以 timeFrom 或 0 為起始時間,接續S2
    // S1. 找此resolution(以下 此res)之起始時間(最大的ts):
    //   S1.1 有資料, 則起始時間=ts+此res(sec),接續S2
    //   S1.2 沒資料, 停止. (為資料初始情況I, 必須設定起始時間timeFrom為0,或1m有資料之時間)
    // S2. 校正起始時間至正確刻度
    //      adjSTime = 1330518155 - (1330518155 % 300); // ex. 300(5m)
    // S3. 取得時間區間內1m資料
    //   S3.1 有資料, 則計算出此res的OHLCV
    //   S3.2 無資料, 停止.
    // S4. 寫入此res之OHLCV (Volume=>Sum)資料
    // S5. 如果有timeTo檢查(>=)是否停止
    // S6. 起始時間=本次起始時間+此res(sec),接續S3

    // SQL samples
    // S1: SELECT MAX(startUnixTimestampSec) as maxTS FROM `ct_udf_history` WHERE `resolution` = "5" AND `exchange` = "CLOUDEX"; 
    // S2: ["1", "5", "15", "30", "60", "1D", "1W", "1M"]
    // S3: SELECT MAX(highPrice) as Hprice, MIN(lowPrice) as Lprice FROM `ct_udf_history` WHERE `resolution` = "1" AND `exchange` = "CLOUDEX" AND startUnixTimestampSec >= 1535357100 AND startUnixTimestampSec < 1535357100 + 300;
    res.send({"test": "aggregateTo"});
}