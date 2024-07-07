const nodemailer = require('nodemailer');

// Create a transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 465,
    auth: {
        user: process.env.userEmail,
        pass: process.env.userPassword
    }
});

const sendEmail = async (to, subject, text, html) => {
    const mailOptions = {
        from: process.env.userEmail, 
        to,
        subject,
        text,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.log('Error sending email: ' + error);
        throw new Error(error.message)
    }
};


module.exports = {sendEmail};
