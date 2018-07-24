const Note = require('../models/note.model.js');

const request = require('request');
const async = require('async');

// Create and Save a new Note
exports.create = (req, res) => {
    // Validate request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }

    // Create a Note
    const note = new Note({
        title: req.body.title || "Untitled Note", 
        content: req.body.content
    });

    // Save Note in the database
    note.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Note."
        });
    });
};

// Retrieve and return all notes from the database.
exports.findAll = (req, res) => {
    // Note.find()
    // .then(notes => {
    //     res.send(notes);
    // }).catch(err => {
    //     res.status(500).send({
    //         message: err.message || "Some error occurred while retrieving notes."
    //     });
    // });
    console.log("start ....");
    async.series([
        /*
            * First external endpoint
            */
        function(callback) {
            request({
                uri: "https://spreadsheets.google.com/feeds/list/1FYy9kGtTzu7OgkJY-R6v89FOxt_99Cj09aQ8WWBgO54/1/public/values?alt=json",
                method: 'GET',
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10
            }, 
            function(err, response, body) {
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
        /*
        * Collate results
        */
        function(err, results) {
            if (err) {
                console.log(err);
                res.send(500, 'Server Error');
                return;
            }
            console.log("end ....");
            var entries = results[0].feed.entry;

            var arr = [];
            var len = entries.length;
            for (var i = 0; i < len; i++) {
                arr.push({
                    category: entries[i].gsx$category.$t,                
                    name: entries[i].gsx$name.$t,
                    label: entries[i].gsx$label.$t,
                    labelzhtw: entries[i].gsx$labelzhtw.$t,
                    datatype: entries[i].gsx$datatype.$t,
                    value: entries[i].gsx$value.$t,
                    use: entries[i].gsx$use.$t,
                    hint: entries[i].gsx$hint.$t
                });
            }

            res.send(arr);
        }
    );
};

// Find a single note with a noteId
exports.findOne = (req, res) => {
    Note.findById(req.params.noteId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });            
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving note with id " + req.params.noteId
        });
    });
};

// Update a note identified by the noteId in the request
exports.update = (req, res) => {
    // Validate Request
    if(!req.body.content) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }

    // Find note and update it with the request body
    Note.findByIdAndUpdate(req.params.noteId, {
        title: req.body.title || "Untitled Note",
        content: req.body.content
    }, {new: true})
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send(note);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Error updating note with id " + req.params.noteId
        });
    });
};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
    Note.findByIdAndRemove(req.params.noteId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send({message: "Note deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.noteId
        });
    });
};