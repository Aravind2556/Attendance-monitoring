const mongoose = require('mongoose')
const alertSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    department: String,
    year: String,
    class: String,
    periodNo: Number,
    date: { type: Date, default: Date.now },
    reason: String
});

module.exports = mongoose.model("Alert", alertSchema);
