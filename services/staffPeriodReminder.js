const Timetable = require("../models/TimeTable");
const { sendStaffReminderMail } = require("../utils/sendStaffReminderMail");

const startStaffPeriodReminder = () => {

    setInterval(async () => {
        try {
            const now = new Date();

            const todayDay = now
                .toLocaleDateString("en-US", { weekday: "long" })
                .toLowerCase();

            const todayDate = now.toISOString().split("T")[0]; // YYYY-MM-DD

            const currentMinutes =
                now.getHours() * 60 + now.getMinutes();

            // fetch today's timetables
            const timetables = await Timetable.find({
                day: todayDay
            });

            for (const tt of timetables) {

                const [hh, mm] = tt.startTime.split(":").map(Number);
                const startMinutes = hh * 60 + mm;

                // 🔥 15 minutes before start + date check
                if (
                    currentMinutes === startMinutes - 15 &&
                    tt.lastReminderDate !== todayDate
                ) {
                    await sendStaffReminderMail({
                        to: tt.staff.email,
                        staffName: tt.staff.name,
                        periodNo: tt.periodNo,
                        startTime: tt.startTime,
                        subject: tt.subject,
                        department: tt.department,
                        year: tt.year,
                        classes: tt.classes
                    });

                    // mark reminder sent for TODAY
                    tt.lastReminderDate = todayDate;
                    await tt.save();

                    console.log(
                        `📧 Reminder sent (${todayDate}) → ${tt.staff.name} | Period ${tt.periodNo}`
                    );
                }
            }

        } catch (err) {
            console.error("Staff Reminder Error:", err.message);
        }
    }, 60 * 1000); // every minute
};

module.exports = { startStaffPeriodReminder };
