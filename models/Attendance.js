const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    userId: { type: String },
    userRole: { type: String },

    thingSpeakId: { type: Number },      // field1 value (1,2,3...)
    entryId: { type: Number },           // ThingSpeak entry_id

    department: { type: String },
    year: { type: String },
    class: { type: String },

    day: { type: String },               // monday
    periodNo: { type: Number },
    entryTime: { type: Date },

    isPresent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
