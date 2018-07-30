module.exports = (app) => {
    const ranking = require('../controllers/ranking.controller.js');

    app.get('/ranking', ranking.rankAll);
}