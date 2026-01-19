const mongoose = require('mongoose')
const alertSchema = new mongoose.Schema({
    studentId: { type: String },
    department: String,
    year: String,
    class: String,
    date: { type: Date, default: Date.now },
    reason: String
});

module.exports = mongoose.model("Alert", alertSchema);
