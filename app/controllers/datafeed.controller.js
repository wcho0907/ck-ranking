var db = require('../../config/database.config.js');
var count = 0;

exports.config = (req, res) => {
    var retObj = {};
    retObj["supports_group_request"] = false;
    retObj["supports_marks"] = false;
    retObj["supports_search"] = true;
    retObj["supports_timescale_marks"] = false;
    retObj["support_time"] = true;
    retObj["supported_resolutions"] = ["1","5","30","60","D","2D"];
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
    retObj["supported_resolutions"] = ["1","5","30","60","D"];
    retObj["intraday_multipliers"] = ["1","5","30","60"];
    retObj["has_intraday"] = true;
    retObj["minmov"] = true;
    retObj["pricescale"] = true;
    retObj["session"] = "24x7";
    retObj["timezone"] = "Asia\/Taipei";
    retObj["ticker"] = retObj["name"];

    res.header("Access-Control-Allow-Origin", "*");
    res.type('text/html; charset=UTF-8');
    res.send(retObj);
}
exports.history = (req, res) => {
    // http://localhost:5000/history?symbol=USD-BTC&resolution=30&from=1532487255&to=1535079315
    console.log(req.query.from + "-" + req.query.to);

    var marketPair = req.query.symbol.split("-");
    var hisBase = marketPair[0];
    var hisQuote = marketPair[1];
    var hisResolution = req.query.resolution
    var hisFrom = req.query.from;
    var hisTo = req.query.to;

    console.log(hisBase + "-" + hisQuote +  "-" + hisResolution +  "-" + hisFrom +  "-" + hisTo)
    var result = {
		t: [], c: [], o: [], h: [], l: [], v: [],
		s: "ok"
	};
    var conn = db.getConnection(); // re-uses existing if already created or creates new one
    conn.connect(function(err) {
        conn.query('SELECT * FROM ct_udf_history',function(error, rows, fields){
            //檢查是否有錯誤
            console.log(++count);
            conn.end();
            if(error){
                throw error;
            }
            result.t.push(parseInt(req.query.from));
            result.o.push(parseFloat(rows[0].openPrice));
            result.h.push(parseFloat(rows[0].highPrice));
            result.l.push(parseFloat(rows[0].lowPrice));
            result.c.push(parseFloat(rows[0].closePrice));
            result.v.push(parseInt(rows[0].totalVolume));

            result.t.push(parseInt(req.query.to) - 1);
            result.o.push(parseFloat(rows[0].openPrice+100));
            result.h.push(parseFloat(rows[0].highPrice+100));
            result.l.push(parseFloat(rows[0].lowPrice+100));
            result.c.push(parseFloat(rows[0].closePrice+100));
            result.v.push(parseInt(rows[0].totalVolume+100));
            res.header("Access-Control-Allow-Origin", "*");
            res.type('text/html; charset=UTF-8');
            res.send(rows);
        });
    });
}