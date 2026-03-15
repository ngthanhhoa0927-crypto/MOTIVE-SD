import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendOtpEmail(to: string, otpCode: string) {
    const mailOptions = {
        from: `"Motive SD" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Motive SD - Your Verification Code",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#2C2B29 0%,#1a1918 100%);padding:32px 40px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:2px;">MOTIVE SD</h1>
        <p style="margin:6px 0 0;color:#a0a0a0;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Premium Headwear</p>
      </td>
    </tr>
    <!-- Body -->
    <tr>
      <td style="padding:40px;">
        <p style="margin:0 0 8px;color:#333;font-size:18px;font-weight:600;">Motive SD sent you an OTP</p>
        <p style="margin:0 0 28px;color:#666;font-size:14px;line-height:1.6;">
          Use the verification code below to complete your sign-in. This code will expire in <strong>10 minutes</strong>.
        </p>
        <!-- OTP Code -->
        <div style="text-align:center;margin:0 0 28px;">
          <div style="display:inline-block;background:#f8f7f4;border:2px dashed #d4d0c8;border-radius:10px;padding:16px 36px;">
            <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#2C2B29;">${otpCode}</span>
          </div>
        </div>
        <p style="margin:0 0 4px;color:#999;font-size:12px;line-height:1.5;">
          If you didn't request this code, you can safely ignore this email.
        </p>
        <p style="margin:0;color:#999;font-size:12px;">
          For security, never share this code with anyone.
        </p>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background:#fafaf9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
        <p style="margin:0;color:#bbb;font-size:11px;">&copy; 2026 Motive SD. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
    };

    await transporter.sendMail(mailOptions);
}
