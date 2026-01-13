const mongoose = require("mongoose");

const collegeUserSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, unique: true },
        fullname: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, unique: true },
        contact: { type: String, match: /^\d{10}$/ },
        gender: { type: String, enum: ["male", "female", "other"] },
        role: { type: String, enum: ["admin", "hod", "tutor", "staff", "student"], required: true, default: 'admin' },
        password: { type: String, required: true },

        department: {
            id: { type: String },
            name: { type: String }
        },
        class: [{ type: String }],
        year: [{ type: String }],

        // STUDENT ONLY
        registerNumber: { type: String },
        parentEmail: { type: String },
        parentContact: { type: String },

        // STAFF ONLY
        employeeId: { type: String },
        isTutor: { type: Boolean, default: false },
        isHod: { type: Boolean, default: false },

    },
    { timestamps: true }
);

module.exports = mongoose.model("CollegeUser", collegeUserSchema);
