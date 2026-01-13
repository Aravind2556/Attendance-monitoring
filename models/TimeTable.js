const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
    {
        day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], required: true },
        periodNo: { type: Number, required: true, min: 1, max: 5 },
        startTime: { type: String },
        endTime: { type: String },
        year: { type: String },
        class: { type: String },
        subject: { type: String },
        staff: {
            id: { type: String },
            name:{type:String}
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
