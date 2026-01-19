const Timetable = require("../models/TimeTable");
const { sendStaffReminderMail } = require("../utils/sendStaffReminderMail");

const startStaffPeriodReminder = () => {

    setInterval(async () => {
        try {
            const now = new Date();

            const today = now
                .toLocaleDateString("en-US", { weekday: "long" })
                .toLowerCase();

            const currentMinutes =
                now.getHours() * 60 + now.getMinutes();

            // fetch today's periods where reminder not sent
            const timetables = await Timetable.find({
                day: today,
                reminderSent: false
            });

            for (const tt of timetables) {

                const [hh, mm] = tt.startTime.split(":").map(Number);
                const startMinutes = hh * 60 + mm;

                // 🔥 15 minutes before start
                if (currentMinutes === startMinutes - 15) {

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

                    // mark as sent
                    tt.reminderSent = true;
                    await tt.save();

                    console.log(
                        `📧 Reminder sent → ${tt.staff.name} | Period ${tt.periodNo}`
                    );
                }
            }

        } catch (err) {
            console.error("Staff Reminder Error:", err.message);
        }
    }, 60 * 1000); // check every minute
};

module.exports = { startStaffPeriodReminder };
