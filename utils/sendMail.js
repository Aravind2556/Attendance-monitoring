const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,   // your gmail
        pass: process.env.MAIL_PASS    // app password
    }
});

const sendParentMail = async ({ to, studentName, date }) => {  
    if (!to) return;

    const mailOptions = {
        from: `"Attendance System" <${process.env.MAIL_USER}>`,
        to,
        subject: "⚠️ Student Absent Notification",
        html: `
            <p>Dear Parent,</p>
            <p>This is to inform you that your ward <b>${studentName}</b> 
            was marked <b>ABSENT</b> on <b>${date}</b>.</p>
            <p>Please contact the college administration if needed.</p>
            <br/>
            <p>Regards,<br/>College Attendance System</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendParentMail };
