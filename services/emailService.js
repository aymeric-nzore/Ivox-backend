export const sendOTPEmail = async (email, code) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error("BREVO_API_KEY manquante dans .env");
      throw new Error("Configuration email manquante");
    }

    if (!process.env.BREVO_FROM_EMAIL) {
      console.error("BREVO_FROM_EMAIL manquante dans .env");
      throw new Error("Configuration expediteur email manquante");
    }

    const payload = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || "IVOX",
        email: process.env.BREVO_FROM_EMAIL,
      },
      to: [{ email }],
      subject: "Reinitialisation de mot de passe - IVOX",
      htmlContent: `
        <h2>Code de réinitialisation</h2>
        <p>Votre code OTP pour réinitialiser votre mot de passe :</p>
        <h1 style="color: #007AFF; font-size: 32px; letter-spacing: 2px;">${code}</h1>
        <p style="color: #666;">Ce code expire dans 60 secondes.</p>
        <p style="color: #999; font-size: 12px;">Si vous n'avez pas demandé de réinitialisation, ignorez cet email.</p>
      `,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Erreur Brevo:", detail);
      throw new Error(`Erreur envoi email: ${response.status}`);
    }

    const result = await response.json();

    console.log("Email OTP envoye avec succes (Brevo):", result?.messageId);
    return result;
  } catch (error) {
    console.error("sendOTPEmail error:", error.message);
    throw error;
  }
};
