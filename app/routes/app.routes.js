module.exports = (app) => {
    const pagesetting = require('../controllers/pagesetting.controller.js');
    const ranking = require('../controllers/ranking.controller.js');
    const loader = require('../controllers/loader.controller.js');
    const datafeed = require('../controllers/datafeed.controller.js');
    const aggregator = require('../controllers/aggregator.controller.js');
    const token = require('../controllers/token.controller.js');

    app.get('/pagesetting', pagesetting.cnconfig);
    
    app.get('/ranking', ranking.rankAll);

    app.get('/loader', loader.loadAll)

    app.get('/config', datafeed.config);

    app.get('/symbols', datafeed.symbols);

    app.get('/history', datafeed.history);

    app.get('/aggregator', aggregator.aggregateTo);

    app.get('/token', token.handleAll);
}