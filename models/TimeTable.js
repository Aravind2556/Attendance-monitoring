const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
    {
        day: {
            type: String,
            enum: ["monday", "tuesday", "wednesday", "thursday", "friday"],
            required: true
        },
        periodNo: { type: Number, required: true, min: 1, max: 5 },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },

        department: String,
        year: String,
        classes: [{ type: String }],

        subject: String,

        staff: {
            id: String,
            name: String,
            email: String
        },

        // 🔥 DATE BASED FLAG
        lastReminderDate: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
