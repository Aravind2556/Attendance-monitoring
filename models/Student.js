const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    entryId : {type : String} ,
    department : {type : String},
    class : {type : String},
    year : {type : String},
    faceEncoding: { type: String },
    createAt : {type : Number},
    isPresent : {type : Boolean}
},
    {timestamps: true}
);

module.exports = mongoose.model("Student", studentSchema);
