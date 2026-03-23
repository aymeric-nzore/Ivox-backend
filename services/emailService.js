import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (email, code) => {
  await resend.emails.send({
    from: "ivox@gmail.com",
    to: email,
    subject: "Code de réinitialisation",
    html: `<h2>Code OTP : ${code}`,
  });
};
