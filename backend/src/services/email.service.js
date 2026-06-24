const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTP(email, otp) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // أو دومينك إذا عندك
      to: email,
      subject: 'OTP Verification',
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Verification Code</h2>
          <p>Your code:</p>
          <h1 style="color: #2563eb; font-size: 32px;">${otp}</h1>
          <p>Valid for 5 minutes</p>
        </div>
      `
    });

    if (error) {
      console.log("Resend error:", error);
      throw new Error(error.message);
    }

    console.log("Email sent:", data);
  } catch (err) {
    console.log("Email failed:", err.message);
    throw err;
  }
}

module.exports = { sendOTP };