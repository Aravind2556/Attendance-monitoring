const mongoose = require('mongoose')
const classSchema = new mongoose.Schema({
    section : {type : String},
    number : {type : String},
    department: {type: String},
    year : {type : String}
});

module.exports = mongoose.model("Class", classSchema);
