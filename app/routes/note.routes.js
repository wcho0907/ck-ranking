module.exports = (app) => {
    const notes = require('../controllers/note.controller.js');

    const ranking = require('../controllers/ranking.controller.js');

    // Create a new Note
    app.post('/notes', notes.create);

    // Retrieve all Notes
    app.get('/notes', notes.findAll);

    app.get('/ranking', ranking.rankAll);
}