const mongoose = require('mongoose');
const department = require('./department');
const staffSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    staffId: { type: String, unique: true, required: true },
    faceEncoding: { type: String },
    entry : [{
        entryId: { type: Number },
        createAt: { type: Number },
        isPresent: { type: Boolean } 
    }]
});

module.exports = mongoose.model("Staff", staffSchema);
