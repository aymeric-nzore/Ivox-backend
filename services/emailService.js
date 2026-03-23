import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (email, code) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY manquante dans .env");
      throw new Error("Configuration email manquante");
    }

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: email,
      subject: "Réinitialisation de mot de passe - IVOX",
      html: `
        <h2>Code de réinitialisation</h2>
        <p>Votre code OTP pour réinitialiser votre mot de passe :</p>
        <h1 style="color: #007AFF; font-size: 32px; letter-spacing: 2px;">${code}</h1>
        <p style="color: #666;">Ce code expire dans 60 secondes.</p>
        <p style="color: #999; font-size: 12px;">Si vous n'avez pas demandé de réinitialisation, ignorez cet email.</p>
      `,
    });

    if (result.error) {
      console.error("Erreur Resend:", result.error);
      throw new Error(`Erreur envoi email: ${result.error.message}`);
    }

    console.log("Email OTP envoyé avec succès:", result.id);
    return result;
  } catch (error) {
    console.error("sendOTPEmail error:", error.message);
    throw error;
  }
};
