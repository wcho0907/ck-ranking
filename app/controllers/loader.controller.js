const async = require('async');
var request = require('request');
var db = require('../../config/database.config.js');

exports.loadAll = (req, res) => {
    //https://min-api.cryptocompare.com/data/histominute?fsym=ZRX&tsym=ETH&toTs=1535241600&limit=1440&aggregate=1&e=OKEX
    //source=cryptocompare&function=history&exchange=OKEX&base=ZRX&quote=ETH&tTs=1535241600&limit=1440
    // REPLACE INTO classes SET stream = 'Red', form = '1', teacher_id = '7';

    if(!req.query.source || !req.query.function){
        res.status(400);
        res.send('InvalidArgument OR MissingParameter');
    }
    else{
        switch(req.query.source) {
            case 'cryptocompare':
                doCryptocompare(req, res);
                break;
            default:
                res.send('Unknown Source');
        }
    }
}

function doCryptocompare(req, res){
    switch(req.query.function){
        case 'history':
            var exchange = req.query.exchange;
            var base = req.query.base;
            var quote = req.query.quote;
            console.log(exchange + " - " + base + " - " + quote);
            async.series([
                function (callback) {
                    request({
                        uri: 'https://min-api.cryptocompare.com/data/histominute?fsym=ZRX&tsym=ETH&toTs=1535241600&limit=1440&aggregate=1&e=OKEX',
                        method: 'GET',
                        timeout: 10000,
                        followRedirect: true,
                        maxRedirects: 10
                      }, function(err, response, body) {
                        if (err) {
                          console.log(err);
                          callback(true);
                          return;
                        }
                        obj = JSON.parse(body);
                        callback(false, obj);
                    });
                }
                ],
                function (err, results) {
                    var hisArray = results[0].Data;
                    // Converting Array of Objects into Array of Arrays
                    var hisValue = hisArray.map(function(obj) {
                        delete obj['volumeto'];
                        return Object.keys(obj).map(function(key) {
                            return obj[key];
                        });
                    });
                    
                    hisValue.forEach(function(item, index, array){
                        item.unshift(exchange);
                        item.splice(2, 0, base, quote);
                        //console.log(item, index, array); // 物件, 索引, 全部陣列
                        return item;                     // forEach 沒在 return 的，所以這邊寫了也沒用
                    });

                    var conn = db.getConnection(); // re-uses existing if already created or creates new one

                    conn.connect(function(_err) {
                        var sql = "INSERT INTO ct_udf_history (exchange, startUnixTimestampSec, baseTokenSymbol, quoteTokenSymbol, openPrice, highPrice, lowPrice, closePrice, totalVolume) VALUES ?";
                        conn.query(sql, [hisValue], function(err, results) {
                            if (_err) console.log(_err);
                        });
                    });
                }
            );
            break;
        default:
            res.send('Unknown Function');
    }
}