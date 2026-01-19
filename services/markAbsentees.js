// services/markAbsentees.js
const UserModel = require("../models/User");
const Attendance = require("../models/Attendance");
const Alert = require("../models/Alert");
const { toDateString } = require("../utils/timeUtils");
const { sendParentMail } = require("../utils/sendMail");

const markAbsenteesAfter0915 = async () => {
    const now = new Date();
    const today = toDateString(now);

    // only after 09:15
    if (now.getHours() < 9 || (now.getHours() === 9 && now.getMinutes() < 15)) {
        return;
    }

    // all students
    const students = await UserModel.find({ role: "student" });

    for (const stu of students) {
        const exists = await Attendance.findOne({
            userId: stu?._id,
            date: today
        });

        if (!exists) {
            // create ABSENT attendance
            await Attendance.create({
                userId: stu._id,
                role: stu?.role,
                department: stu.department,
                year: Array.isArray(stu.year) ? stu.year[0] : stu.year,
                class: Array.isArray(stu.class) ? stu.class[0] : stu.class,
                date: today,
                entryTime: null,
                isPresent: false
            });

            // create alert
            await Alert.create({
                studentId: stu?._id,
                role : stu?.role,
                department: stu?.department,
                year: Array.isArray(stu.year) ? stu.year[0] : stu.year,
                class: Array.isArray(stu.class) ? stu.class[0] : stu.class,
                date: today,
                reason: "Absent – no entry before 09:15"
            });

            await sendParentMail({
                to: stu?.parentEmail,
                studentName: stu?.fullname,
                date: today
            });

            console.log("ABSENT + ALERT:", stu.fullname);
        }
    }
};

module.exports = { markAbsenteesAfter0915 };
