// services/thingSpeakListener.js
const fetch = require("node-fetch"); // node-fetch@2
const UserModel = require("../models/User");
const Attendance = require("../models/Attendance");
const { isBefore0915, toDateString } = require("../utils/timeUtils");

const THINGSPEAK_URL = "https://api.thingspeak.com/channels/3230860/feeds.json?api_key=PQFTWVC4Z7J8R4NH&results=1";

const fetchLatestField = async () => {
    try {
        const response = await fetch(THINGSPEAK_URL);
        const data = await response.json();
        if (!data?.feeds?.length) return;

        const feed = data.feeds[data.feeds.length - 1];
        if (!feed.field1) return;

        const thingSpeakId = Number(feed.field1);
        const entryTime = new Date(feed.created_at || Date.now());
        const today = toDateString(entryTime);

        //student only
        const student = await UserModel.findOne({
            id: thingSpeakId
        });
        if (!student) return;

        // already marked today?
        const already = await Attendance.findOne({
            userId: student?._id,
            date: today
        });
        if (already) return;

        //check 09:15
        if (isBefore0915(entryTime)) {
            await Attendance.create({
                userId: student._id,
                role: student?.role,
                department: student.department,
                year: Array.isArray(student.year) ? student.year[0] : student.year,
                class: Array.isArray(student.class) ? student.class[0] : student.class,
                date: today,
                entryTime,
                isPresent: true
            });
        }
    } catch (err) {
        console.error("ThingSpeak Error:", err.message || err);
    }
};

module.exports = { fetchLatestField };
