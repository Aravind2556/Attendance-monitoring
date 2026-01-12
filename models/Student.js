const mongoose = require('mongoose');
const department = require('./department');

const studentSchema = new mongoose.Schema({
    id : {type : String , unique : true , required : true},
    registerNumber: { type: String, required: true, unique: true },
    name : {type : String},
    email : {type : String},
    contact : {type : String},
    gender : {type : String},
    parentEmail : {type : String},
    parentContact : {type : String},
    department : {type : String},
    class : {type : String},
    year : {type : Number},
    faceEncoding: { type: String },
    entry : [{
        entryId : {type : Number},
        createAt : {type : Number},
        isPresent : {type : Boolean}
    }] 
},
    {timestamps: true}
);

module.exports = mongoose.model("Student", studentSchema);
