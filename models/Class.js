const mongoose = require('mongoose')
const classSchema = new mongoose.Schema({
    section: { type: String, required: true, unique: true },
    number: { type: String, required: true, unique: true },
    department: { type: String },
    year: { type: String }
});

module.exports = mongoose.model("Class", classSchema);
