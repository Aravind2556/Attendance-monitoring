const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
    {
        day: {
            type: String,
            enum: ["monday", "tuesday", "wednesday", "thursday", "friday"],
            required: true
        },
        periodNo: { type: Number, required: true, min: 1, max: 5 },
        startTime: { type: String, required: true }, // "09:00"
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

        reminderSent: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
