const async = require('async');
var db = require('../../config/database.config.js');
var count = 0;
var tableName = "ct_udf_history";
// S0. 如果有timeFrom則以timeFrom為起始時間,接續S2
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
// S1: SELECT MAX(startUnixTimestampSec) as maxTS FROM `ct_udf_history` WHERE `resolution` = "5" AND `exchange` = "CLOUDEX" AND baseTokenSymbol = "MTT" AND quoteTokenSymbol = "WETH"; 
// S2: ["1", "5", "15", "30", "60", "1D", "1W", "1M"]
// S3: 
//   var openSQL  = '(SELECT openPrice from `ct_udf_history` WHERE `resolution` = "1" AND `exchange` = "CLOUDEX" AND baseTokenSymbol = "MTT" AND quoteTokenSymbol = "WETH" AND startUnixTimestampSec >= 1535530200 AND startUnixTimestampSec< 1535530200 + 300 order by startUnixTimestampSec LIMIT 1) as Oprice';
//   var closeSQL = '(SELECT closePrice from `ct_udf_history` WHERE `resolution` = "1" AND `exchange` = "CLOUDEX" AND baseTokenSymbol = "MTT" AND quoteTokenSymbol = "WETH" AND startUnixTimestampSec >= 1535530200 AND startUnixTimestampSec< 1535530200 + 300 order by startUnixTimestampSec DESC LIMIT 1) as Cprice';
//   var mainSQL = 'SELECT ' + openSQL + ', MAX(highPrice) as Hprice, MIN(lowPrice) as Lprice, ' + closeSQL + ', SUM(totalVolume) as SumVolume FROM `ct_udf_history` WHERE `resolution` = "1" AND `exchange` = "CLOUDEX" AND baseTokenSymbol = "MTT" AND quoteTokenSymbol = "WETH" AND startUnixTimestampSec >= 1535530200 AND startUnixTimestampSec< 1535530200 + 300;';

exports.aggregateTo = (req, res) => {
    var exchange = req.query.exchange;
    var base = req.query.base;
    var quote = req.query.quote;
    var resolutionTo = req.query.resolutionTo;
    var timeFrom = req.query.timeFrom;
    var timeTo = req.query.timeTo;

    console.log(exchange + "-" + base + "-" + quote + "-" + resolutionTo + "-" + timeFrom + "-" + timeTo);

    var resSec;
    switch(resolutionTo){
        case '5':
            resSec = 5 * 60;
            break;
        default:
            res.send("Error: resolution[" + resolutionTo + "] is not supported");
            return;
    }

    // S0. 如果有timeFrom則以timeFrom為起始時間,接續S2
    var startTime;
    if(timeFrom){
        startTime = parseInt(timeFrom);
    }
    else{
        // S1. 找此resolution(以下 此res)之起始時間(最大的ts):
        var conn = db.getConnection(); // re-uses existing if already created or creates new one

        conn.connect(function(_err) {
            if (_err) console.log(_err);
            var sql = 'SELECT MAX(startUnixTimestampSec) as maxTS FROM `' + tableName + '` WHERE `resolution` = "5" AND `exchange` = "CLOUDEX" AND baseTokenSymbol = "MTT" AND quoteTokenSymbol = "WETH"';
            conn.query(sql, function(err, rt) {
                if (err) console.log(err);

                console.log(">>"+ JSON.stringify(rt));
                
                //   S1.1 有資料, 則起始時間=ts+此res(sec),接續S2
                if(rt[0].maxTS){
                    startTime = rt[0].maxTS;
                }
                else{
                    //   S1.2 沒資料, 停止. (為資料初始情況I, 必須設定起始時間timeFrom為0,或1m有資料之時間)
                }

                res.send({"startTime": startTime});
                return;

                // S2. 校正起始時間至正確刻度
                //      adjSTime = 1330518155 - (1330518155 % 300); // ex. 300(5m)
                // S3. 取得時間區間內1m資料
                //   S3.1 有資料, 則計算出此res的OHLCV
                //   S3.2 無資料, 停止.
                // S4. 寫入此res之OHLCV (Volume=>Sum)資料
                // S5. 如果有timeTo檢查(>=)是否停止
                // S6. 起始時間=本次起始時間+此res(sec),接續S3
            });
        });
    }
    // SQL samples
    // S1: SELECT MAX(startUnixTimestampSec) as maxTS FROM `ct_udf_history` WHERE `resolution` = "5" AND `exchange` = "CLOUDEX" AND baseTokenSymbol = "MTT" AND quoteTokenSymbol = "WETH"; 
    // S2: ["1", "5", "15", "30", "60", "1D", "1W", "1M"]
    // S3: 
    //var openSQL  = '(SELECT openPrice from `' + tableName + '` WHERE `resolution` = "1" AND `exchange` = "CLOUDEX" AND baseTokenSymbol = "MTT" AND quoteTokenSymbol = "WETH" AND startUnixTimestampSec >= 1535530200 AND startUnixTimestampSec< 1535530200 + 300 order by startUnixTimestampSec LIMIT 1) as Oprice';
    //var closeSQL = '(SELECT closePrice from `' + tableName + '` WHERE `resolution` = "1" AND `exchange` = "CLOUDEX" AND baseTokenSymbol = "MTT" AND quoteTokenSymbol = "WETH" AND startUnixTimestampSec >= 1535530200 AND startUnixTimestampSec< 1535530200 + 300 order by startUnixTimestampSec DESC LIMIT 1) as Cprice';
    //var mainSQL = 'SELECT ' + openSQL + ', MAX(highPrice) as Hprice, MIN(lowPrice) as Lprice, ' + closeSQL + ', SUM(totalVolume) as SumVolume FROM `' + tableName + '` WHERE `resolution` = "1" AND `exchange` = "CLOUDEX" AND baseTokenSymbol = "MTT" AND quoteTokenSymbol = "WETH" AND startUnixTimestampSec >= 1535530200 AND startUnixTimestampSec< 1535530200 + 300;';
    //console.log(">>"+mainSQL);
}