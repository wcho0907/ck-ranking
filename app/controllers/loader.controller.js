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
            var exchange = "CLOUDEX"; //req.query.exchange;
            var base = req.query.base;
            var quote = req.query.quote;
            var toTs = req.query.toTs;
            var resolution = req.query.resolution; 
            console.log(exchange + " - " + base + " - " + quote + " - " + toTs + resolution);
            async.series([
                function (callback) {
                    var tURI;
                    switch(base){
                        case 'MTT':
                            tURI = 'https://min-api.cryptocompare.com/data/histominute?fsym=' + 'ZRX' + '&tsym=' + 'ETH' + '&toTs=' + toTs + '&limit=1440&aggregate=' + resolution + '&e=OKEX';
                            break;
                        case 'TEST1':
                            tURI = 'https://min-api.cryptocompare.com/data/histominute?fsym=' + 'OMG' + '&tsym=' + 'ETH' + '&toTs=' + toTs + '&limit=1440&aggregate=' + resolution + '&e=OKEX';
                            break;  
                        case 'TEST2':
                            tURI = 'https://min-api.cryptocompare.com/data/histominute?fsym=' + 'WTC' + '&tsym=' + 'ETH' + '&toTs=' + toTs + '&limit=1440&aggregate=' + resolution + '&e=OKEX';
                            break;                                                        
                    }
                    console.log("uri: " + tURI);
                    request({
                        uri: tURI,
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

                    var hisValue = [];
                    hisArray.forEach(function(item, index, array){
                        var arrItem = [];
                        arrItem.push(resolution);
                        arrItem.push(exchange);
                        arrItem.push(item["time"]);
                        arrItem.push(base);
                        arrItem.push(quote);
                        arrItem.push(item["open"]);
                        arrItem.push(item["high"]);
                        arrItem.push(item["low"]);
                        arrItem.push(item["close"]);
                        arrItem.push(item["volumefrom"]);

                        hisValue.push(arrItem);
                    });
                    //res.send(hisValue);

                    var conn = db.getConnection(); // re-uses existing if already created or creates new one

                    conn.connect(function(_err) {
                        if (_err) console.log(_err);
                        var sql = "INSERT INTO ct_udf_history (resolution, exchange, startUnixTimestampSec, baseTokenSymbol, quoteTokenSymbol, openPrice, highPrice, lowPrice, closePrice, totalVolume) VALUES ?";
                        conn.query(sql, [hisValue], function(err, results) {
                            if (err) console.log(err);
                            res.send('Done');
                        });
                    });
                }
            );
            break;
        default:
            res.send('Unknown Function');
    }
}