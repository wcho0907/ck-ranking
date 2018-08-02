module.exports = (app) => {
    const ranking = require('../controllers/ranking.controller.js');

    const loader = require('../controllers/loader.controller.js');

    app.get('/ranking', ranking.rankAll);

    app.get('/loader', loader.loadAll)
}