import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.SMTP_USER,
    clientId: process.env.SMTP_CLIENT_ID,
    clientSecret: process.env.SMTP_CLIENT_SECRET,
    refreshToken: process.env.SMTP_REFRESH,
  },
});

const FROM_ADDRESS =
  process.env.SMTP_FROM ?? `"TalkTherapy" <no-reply@talktherapy.app>`;

export async function sendActivationEmail(
  to: string,
  otpCode: string,
): Promise<void> {
  await transporter.sendMail({
    from: FROM_ADDRESS,
    to,
    subject: "Activate your TalkTherapy account",
    text: `Your activation code is: ${otpCode}\n\nThis code expires in 30 minutes. Do not share it with anyone.`,
    html: `
      <p>Use the following code to activate your account:</p>
      <h2 style="letter-spacing:0.2em">${otpCode}</h2>
      <p>This code expires in <strong>30 minutes</strong>. Do not share it with anyone.</p>
    `,
  });
}
