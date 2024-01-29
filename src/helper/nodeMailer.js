const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
// dotenv.config();
const fs = require('fs');

const sendMail = async (data) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_MAIL,
            pass: process.env.USER_PASSWORD
        },
        tls: {
            rejectUnauthorized: false, // Allow insecure connections (not recommended for production)
        },
    });

    const mailOptions = {
        from: process.env.USER_MAIL,
        to: data.to,
        subject: data.subject,
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                <div style="margin:50px auto;width:70%;padding:20px 0">
                    <div style="border-bottom:1px solid #eee">
                        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Disha</a>
                    </div>
                    <p style="font-size:1.1em">Hi,</p>
                    <p>Thank you for choosing Disha. Use the following OTP for reset password.</p>
                    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${data.html}</h2>
                    <p style="font-size:0.9em;">Regards,<br />MPP Disha</p>
                    <hr style="border:none;border-top:1px solid #eee" />
                </div>
            </div>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('email error', error);
        } else {
            console.log('Email sent: ' + info.response);
            // do something useful
        }
    });
}


const sendmultiple = async (recipientList) => {
    function createTransporter() {
        return nodemailer.createTransport({
            service: 'Gmail', // Use the appropriate email service
            auth: {
                user: process.env.USER_MAIL,
                pass: process.env.USER_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async function sendEmail(transporter, recipientEmail, subject, htmlContent) {
        try {
            await transporter.sendMail({
                to: recipientEmail,
                subject: subject,
                html: `
                <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">MPP Disha</a>
                        </div>
                        <p style="font-size:1.1em,color:#000">Hi,</p>
                        <p style="color:#000">We appreciate you picking MPP Disha. Your Carreer advice has been scheduled.</p>
                        <p style="color:#000">Student Name : <span style="color:#007bff">${htmlContent.name}</span></p>
                        <p style="color:#000">Mobile No. : <span style="color:#007bff">${htmlContent.mobile}</span></p>
                        <p style="color:#000">Email : <span style="color:#007bff">${htmlContent.email}</span></p>
                        <p style="color:#000">Schedule Date : <span style="color:#007bff">${htmlContent.date}</span></p>
                        <p style="color:#000">Schedule Time : <span style="color:#007bff">${htmlContent.time}</span></p>
                        <p style="color:#000">Query : <span style="color:#007bff">${htmlContent?.title ? htmlContent?.title : ''},${htmlContent?.query ? htmlContent?.query : ''}</span></p>
                        <p style="font-size:0.9em;">Regards,<br />MPP Disha</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                    </div>
                </div>
            `,
            });
            console.log(`Email sent successfully to ${recipientEmail}`);
        } catch (error) {
            console.error(`Error sending email to ${recipientEmail}:`, error);
        }
    }

    async function sendMultipleEmails(recipientList) {
        const transporter = createTransporter();

        for (const recipient of recipientList) {
            const { email, subject, htmlContent } = recipient;
            await sendEmail(transporter, email, subject, htmlContent);
        }
    }

    sendMultipleEmails(recipientList)
}

module.exports = { sendMail, sendmultiple }