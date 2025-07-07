import nodemailer from "nodemailer";

export const sendOTP = async (to: string, otp: string): Promise<void> => {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transport.sendMail({
    from: process.env.EMAIL_ID,
    to,
    subject: "Your OTP for reset password",
    html: `<p>Your OTP is: <strong>${otp}</strong></p><p>Valid for 5 minutes.</p>`,
  });
};
