const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const sendStaffReminderMail = async ({
    to,
    staffName,
    periodNo,
    startTime,
    subject,
    department,
    year,
    classes
}) => {
    if (!to) return;

    await transporter.sendMail({
        from: `"College Timetable" <${process.env.MAIL_USER}>`,
        to,
        subject: `⏰ Period ${periodNo} starts at ${startTime}`,
        html: `
            <p>Dear <b>${staffName}</b>,</p>

            <p>This is a reminder that your class will start in <b>15 minutes</b>.</p>

            <ul>
              <li><b>Period:</b> ${periodNo}</li>
              <li><b>Start Time:</b> ${startTime}</li>
              <li><b>Subject:</b> ${subject}</li>
              <li><b>Department:</b> ${department}</li>
              <li><b>Year:</b> ${year}</li>
              <li><b>Class:</b> ${classes.join(", ")}</li>
            </ul>

            <p>Please be prepared.</p>
            <br/>
            <p>— Attendance & Timetable System</p>
        `
    });
};

module.exports = { sendStaffReminderMail };
