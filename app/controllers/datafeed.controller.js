var db = require('../../config/database.config.js');
var count = 0;

exports.config = (req, res) => {
    var retObj = {};
    retObj["supports_group_request"] = false;
    retObj["supports_marks"] = false;
    retObj["supports_search"] = true;
    retObj["supports_timescale_marks"] = false;
    retObj["support_time"] = true;
    retObj["supported_resolutions"] = ["1"];//["1","5","30","60","D","2D"];
    retObj["session-regular"] = "24x7";

    res.header("Access-Control-Allow-Origin", "*");
    res.type('text/html; charset=UTF-8');
    res.send(retObj);
}
exports.symbols = (req, res) => {
    var marketPair = req.query.symbol.split("-");
    var symBase = marketPair[0];
    var symQuote = marketPair[1];
    var retObj = {};
    retObj["name"] = symBase + "-" + symQuote;
    retObj["description"] = "CloudEX, " + retObj["name"];
    retObj["supported_resolutions"] = ["1"];//["1","5","30","60","D"];
    retObj["intraday_multipliers"] = ["1"];//["1","5","30","60"];
    retObj["has_intraday"] = true;
    retObj["minmov"] = 1;
    retObj["pricescale"] = 100000;
    retObj["volume_precision"] = 2;
    retObj["session"] = "24x7";
    retObj["timezone"] = "Asia\/Taipei";
    retObj["ticker"] = retObj["name"];

    res.header("Access-Control-Allow-Origin", "*");
    res.type('text/html; charset=UTF-8');
    res.send(retObj);
}
exports.history = (req, res) => {
    var marketPair = req.query.symbol.split("-");
    var hisBase = marketPair[0];
    var hisQuote = marketPair[1];
    var hisResolution = req.query.resolution;
    var hisFrom = req.query.from;
    var hisTo = req.query.to;

    //console.log(hisBase + "-" + hisQuote +  "-" + hisResolution +  "-" + hisFrom +  "-" + hisTo)

    var conn = db.getConnection();
    conn.connect(function(err) {
        var sql = "SELECT * FROM ct_udf_history WHERE resolution = ? AND exchange = ? AND baseTokenSymbol = ? AND quoteTokenSymbol = ? AND startUnixTimestampSec >= ? AND startUnixTimestampSec < ?";
        var query = conn.query(sql, [hisResolution, "CLOUDEX", hisBase, hisQuote, hisFrom, hisTo], function(error, rows){
            console.log(++count);
            conn.end();
            if(error){
                console.log('this.sql', this.sql);
                console.log(err);
                throw error;
            }
            var result
            if(rows.length < 1){
                res.header("Access-Control-Allow-Origin", "*");
                res.type('text/html; charset=UTF-8');
                var noData = {};
                noData["s"] = "no_data";
                //noData["nextTime"] = parseInt(hisFrom) - 60; // makes continuous data demanding
                res.send(noData);
                return;
            }
            else{
                var result = {
                    t: [], c: [], o: [], h: [], l: [], v: [],
                    s: "ok"
                };
                rows.forEach(function(item, index, array){
                    result.t.push(parseInt(item.startUnixTimestampSec));
                    result.o.push(parseFloat(item.openPrice));
                    result.h.push(parseFloat(item.highPrice));
                    result.l.push(parseFloat(item.lowPrice));
                    result.c.push(parseFloat(item.closePrice));
                    result.v.push(parseFloat(item.totalVolume));
                });
                res.header("Access-Control-Allow-Origin", "*");
                res.type('text/html; charset=UTF-8');
                res.send(result);
                return;
            }
        });
        console.log(query.sql);
    });
}