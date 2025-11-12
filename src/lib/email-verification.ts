import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  secure: process.env.EMAIL_SERVER_PORT === "465",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string
) {
  try {
    if (
      !process.env.EMAIL_SERVER_HOST ||
      !process.env.EMAIL_SERVER_USER ||
      !process.env.EMAIL_SERVER_PASSWORD ||
      !process.env.EMAIL_FROM
    ) {
      console.error("❌ Configuration email incomplète pour vérification");
      throw new Error("Configuration email manquante");
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "✅ Vérifiez votre email - Luxury Djerba Adventure",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Bienvenue ${name} !</h2>
          <p>Merci de vous être inscrit sur Luxury Djerba Adventure.</p>
          <p>Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background-color: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Vérifier mon email
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Ce lien est valide pendant 24 heures. Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
            <a href="${verificationUrl}" style="color: #0ea5e9; word-break: break-all;">${verificationUrl}</a>
          </p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Cordialement,<br>L'équipe Luxury Djerba Adventure
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email de vérification envoyé à", email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email de vérification:",
      error
    );
    throw error;
  }
}
