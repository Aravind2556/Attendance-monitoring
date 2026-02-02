const nodemailer = require("nodemailer");
require('dotenv').config();
const accountSid = process.env.twilioSID;
const authToken = process.env.twilioAuthToken;
const messagingServiceSid = process.env.twilioServiceSID;
const client = require('twilio')(accountSid, authToken);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,   // your gmail
        pass: process.env.MAIL_PASS    // app password
    }
});

// const sendParentMail = async ({ to, studentName, date }) => {  
//     if (!to) return;

//     const mailOptions = {
//         from: `"Attendance System" <${process.env.MAIL_USER}>`,
//         to,
//         subject: "⚠️ Student Absent Notification",
//         html: `
//             <p>Dear Parent,</p>
//             <p>This is to inform you that your ward <b>${studentName}</b> 
//             was marked <b>ABSENT</b> on <b>${date}</b>.</p>
//             <p>Please contact the college administration if needed.</p>
//             <br/>
//             <p>Regards,<br/>College Attendance System</p>
//         `
//     };

//     await transporter.sendMail(mailOptions);
// };




const sendParentSMS = ({ to, studentName, date }) => {
console.log("SMS is sends")
    const body = `Dear Parent,

This is to inform you that your ward ${studentName}
was marked ABSENT on ${date}.

Please contact the college administration if needed.

Regards,
College Attendance System`
    
    client.messages
        .create({
            body: body,
            messagingServiceSid: messagingServiceSid,
            to: to
        })
        .then(message => {
            console.log(message.sid)
        })
        .catch(err => {
            console.error("Error sending SMS:", err)
        });
}

// module.exports = sendSms;
module.exports = { sendParentSMS };
