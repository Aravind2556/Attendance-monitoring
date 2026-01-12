const mongoose = require('mongoose')
const classSchema = new mongoose.Schema({
    id : {type : Number , unique : true , required : true},
    section : {type : String},
    department: {type: String},
    year : {type : String}
});

module.exports = mongoose.model("Class", classSchema);
