const mongoose = require('mongoose');
const department = require('./department');

const studentSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    studentId : {type : String , unique : true , required : true},
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
