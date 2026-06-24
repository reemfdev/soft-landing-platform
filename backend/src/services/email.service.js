const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465 ,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendOTP(email, otp) {
  await transporter.sendMail({
    from: `"Soft Landing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "OTP Verification",
    html: `
      <div>
        <h2>Verification Code</h2>
        <p>Your code:</p>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      </div>
    `
  });
}

module.exports = { sendOTP };