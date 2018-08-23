module.exports = (app) => {
    const ranking = require('../controllers/ranking.controller.js');

    const loader = require('../controllers/loader.controller.js');

    const datafeed = require('../controllers/datafeed.controller.js');

    app.get('/ranking', ranking.rankAll);

    app.get('/loader', loader.loadAll)

    app.get('/config', datafeed.config);

    app.get('/symbols', datafeed.symbols);

    app.get('/history', datafeed.history);
}