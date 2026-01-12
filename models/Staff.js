const mongoose = require('mongoose');
const department = require('./department');
const staffSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    emplyeeId : {type : String},
    name: { type: String },
    email: { type: String },
    contact: { type: String },
    gender: { type: String },
    department: { type: String },
    isTutor: { type: Boolean },
    class: { type: String },
    isHod : {type : Boolean},
    faceEncoding: { type: String },
    entry : [{
        entryId: { type: Number },
        createAt: { type: Number },
        isPresent: { type: Boolean } 
    }]
});

module.exports = mongoose.model("Staff", staffSchema);
