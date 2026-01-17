// services/thingSpeakListener.js
const fetch = require("node-fetch"); // node-fetch@2 (CommonJS)
const UserModel = require("../models/User");
const Timetable = require("../models/TimeTable");
const Attendance = require("../models/Attendance");
const Alert = require("../models/Alert");
const { isWithinGraceTime } = require("../utils/timeUtils");

const THINGSPEAK_URL =
    "https://api.thingspeak.com/channels/3230860/feeds.json?api_key=PQFTWVC4Z7J8R4NH&results";

const fetchLatestField = async () => {
    try {
        // 1) Fetch latest ThingSpeak feed
        const response = await fetch(THINGSPEAK_URL);
        const data = await response.json();
        if (!data?.feeds?.length) return;

        const lastFeed = data.feeds[data.feeds.length - 1];
        const thingSpeakRaw = lastFeed.field1;
        if (!thingSpeakRaw) return;

        // treat thingSpeak id as numeric if possible, else as string
        const thingSpeakId = Number(thingSpeakRaw);
        // 2) Lookup user by uniqueId field (change if your field name differs)
        const user = await UserModel.findOne({ id : thingSpeakId });
        if (!user) {
            console.log("ThingSpeak: user not found for id", thingSpeakRaw);
            return;
        }

        // 3) normalize today, year, class
        const today = new Date()
            .toLocaleDateString("en-US", { weekday: "long" })
            .toLowerCase();

        const userYear = Array.isArray(user.year) ? user.year[0] : user.year;
        const userClass = Array.isArray(user.class) ? user.class[0] : user.class;

        // 4) find timetable: prefer timetable where classes includes userClass
        let timetable = null;
        if (userClass) {
            timetable = await Timetable.findOne({
                department: user.department,
                year: userYear,
            });
        }

        console.log("time table" , timetable)

        // 4b) fallback: find timetable for department+year+day where classes is empty or missing
        if (!timetable) {
            timetable = await Timetable.findOne({
                department: user.department,
                year: userYear,
            });
        }

        if (!timetable) {
            console.log("No timetable found for", {
                dept: user.department,
                year: userYear,
                day: today,
                maybeClass: userClass
            });
            return;
        }

        // 5) determine present/late using timetable.startTime
        const present = isWithinGraceTime(timetable.startTime, 5);
        console.log("present", present, "for user", user.fullname);

        // 6) avoid duplicate marking for same user/day/period
        const alreadyMarked = await Attendance.findOne({
            userId: user._id,
            day: today,
            periodNo: timetable.periodNo
        });

        if (alreadyMarked) {
            console.log("Attendance already recorded for", user.fullname);
            return;
        }

        // 7) create attendance record (always create)
        const attendance = await Attendance.create({
            userId: user._id,
            userRole: user.role,
            department: user.department,
            year: userYear,
            class: userClass,
            day: today,
            periodNo: timetable.periodNo,
            entryTime: new Date(lastFeed.created_at || Date.now()),
            isPresent: present
        });

        console.log("Attendance marked:", attendance._id);
        console.log(`${present ? "PRESENT ✅" : "LATE/ABSENT ❌"} ${user.fullname}`);

        // 8) immediate alert for this user if late
        if (!present) {
            await Alert.create({
                studentId: user._id,
                department: user.department,
                year: userYear,
                class: userClass,
                periodNo: timetable.periodNo,
                reason: "Late entry (outside grace time)"
            });
            console.log(`🚨 Immediate ALERT created for late user ${user.fullname}`);
        }

        // 9) After 10 minutes: mark absent & create alerts for all students who still don't have attendance
        setTimeout(async () => {
            try {
                // find all students in same dept/year/class
                const allStudents = await UserModel.find({
                    role: "student",
                    department: user.department,
                    year: userYear,
                    class: userClass
                });

                for (const stu of allStudents) {
                    const exists = await Attendance.findOne({
                        userId: stu._id,
                        day: today,
                        periodNo: timetable.periodNo
                    });

                    if (!exists) {
                        // create absent attendance record (if you want explicit absent record)
                        await Attendance.create({
                            userId: stu._id,
                            userRole: "student",
                            department: stu.department,
                            year: Array.isArray(stu.year) ? stu.year[0] : stu.year,
                            class: Array.isArray(stu.class) ? stu.class[0] : stu.class,
                            day: today,
                            periodNo: timetable.periodNo,
                            entryTime: null,
                            isPresent: false
                        });

                        await Alert.create({
                            studentId: stu._id,
                            department: stu.department,
                            year: Array.isArray(stu.year) ? stu.year[0] : stu.year,
                            class: Array.isArray(stu.class) ? stu.class[0] : stu.class,
                            periodNo: timetable.periodNo,
                            reason: "Absent – no entry within 10 minutes"
                        });

                        console.log(`🚨 ALERT created for absent student ${stu.fullname}`);
                    }
                }
            } catch (e) {
                console.error("ThingSpeak (10min check) error:", e.message || e);
            }
        }, 10 * 60 * 1000); // 10 minutes

    } catch (err) {
        console.error("ThingSpeak Error:", err.message || err);
    }
};

module.exports = { fetchLatestField };
