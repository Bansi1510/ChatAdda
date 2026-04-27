import nodemailer from "nodemailer"


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('gmail service error');
  } else {
    console.log('gmail service connected sucessfully');
  }
});

const sendOtpToEmail = async (email: string, otp: string) => {
  const html = `<body style="margin:0; padding:0; font-family:Arial, sans-serif; background:#f6f9fc;">
  <div style="max-width:420px; margin:40px auto; background:#ffffff; padding:30px; border-radius:12px; text-align:center; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
    
    <h2 style="margin-bottom:10px; color:#333;">OTP Verification</h2>
    
    <p style="color:#666; font-size:14px;">
      Use the code below to verify your account
    </p>

    <div style="margin:25px 0; font-size:32px; font-weight:bold; letter-spacing:8px; color:#4f46e5;">
      ${otp}
    </div>

    <p style="color:#888; font-size:13px;">
      This code will expire in 5 minutes
    </p>

    <hr style="margin:25px 0; border:none; border-top:1px solid #eee;" />

    <p style="font-size:12px; color:#aaa;">
      If you didn’t request this, just ignore this email.
    </p>

  </div>
</body>`
  await transporter.sendMail({
    to: email,
    from: process.env.SMTP_USER,
    subject: "Your chat-adda verication code ",
    html,
  });
}

export default sendOtpToEmail;