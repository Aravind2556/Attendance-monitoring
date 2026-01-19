const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
    {
        day: { type: String, enum: ["monday", "yuesday", "wednesday", "hhursday", "friday"], required: true },
        periodNo: { type: Number, required: true, min: 1, max: 5 },
        startTime: { type: String },
        endTime: { type: String },
        department : {type : String},
        year: { type: String },
        classes: [{ type: String }],
        subject: { type: String },
        staff: {
            id: { type: String },
            name:{type:String}
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
