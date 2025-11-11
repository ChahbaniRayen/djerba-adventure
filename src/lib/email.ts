import nodemailer from "nodemailer";

// Vérifier que les variables d'environnement sont définies
const emailConfig = {
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  secure: process.env.EMAIL_SERVER_PORT === "465",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
};

if (!emailConfig.host || !emailConfig.auth.user || !emailConfig.auth.pass) {
  console.warn(
    "⚠️ Configuration email manquante. Les emails ne seront pas envoyés."
  );
  console.warn(
    "Variables requises: EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, EMAIL_FROM"
  );
}

const transporter = nodemailer.createTransport(emailConfig);

interface BookingEmail {
  email: string;
  name?: string;
  activityName: string;
  activityType?: "activity" | "tour" | "transfer";
  date: Date | string;
  time: string;
  participants: number;
  phone?: string;
  notes?: string;
}

export async function sendBookingConfirmationEmail(booking: BookingEmail) {
  try {
    // Vérifier la configuration
    if (
      !process.env.EMAIL_SERVER_HOST ||
      !process.env.EMAIL_SERVER_USER ||
      !process.env.EMAIL_SERVER_PASSWORD ||
      !process.env.EMAIL_FROM
    ) {
      console.error("❌ Configuration email incomplète. Email non envoyé.");
      throw new Error("Configuration email manquante");
    }

    if (!booking.email) {
      console.error("❌ Email du client manquant dans la réservation");
      throw new Error("Email du client manquant");
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: booking.email,
      subject: `Confirmation de réservation - ${booking.activityName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Confirmation de votre réservation</h2>
          <p>Bonjour ${booking.name || "Client"},</p>
          <p>Votre demande de réservation pour <strong>${
            booking.activityName
          }</strong> a été confirmée !</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Détails de la réservation :</h3>
            <p><strong>Activité :</strong> ${booking.activityName}</p>
            <p><strong>Date :</strong> ${new Date(
              booking.date
            ).toLocaleDateString("fr-FR")}</p>
            <p><strong>Heure :</strong> ${booking.time}</p>
            <p><strong>Nombre de participants :</strong> ${
              booking.participants
            }</p>
            ${booking.phone ? `<p><strong>Téléphone :</strong> ${booking.phone}</p>` : ""}
            ${booking.notes ? `<p><strong>Notes :</strong> ${booking.notes}</p>` : ""}
          </div>
          <p>Nous vous contacterons prochainement pour finaliser les détails.</p>
          <p>Cordialement,<br>L'équipe Djerba Adventures</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email de confirmation envoyé à", booking.email);
    console.log("Message ID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email de confirmation:",
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Détails:", errorMessage);

    // Message d'erreur plus clair pour Gmail
    if (
      error instanceof Error &&
      ("code" in error || "responseCode" in error)
    ) {
      const emailError = error as { code?: string; responseCode?: number };
      if (emailError.code === "EAUTH" || emailError.responseCode === 535) {
        const friendlyError = new Error(
          "Erreur d'authentification Gmail. Vérifiez que vous utilisez un mot de passe d'application (pas votre mot de passe Gmail normal). Consultez CONFIGURATION-EMAIL.md pour plus d'informations."
        );
        throw friendlyError;
      }
    }

    throw error; // Propager l'erreur pour qu'elle soit visible dans l'API
  }
}

export async function sendBookingNotificationToAdmin(booking: BookingEmail) {
  try {
    // Vérifier la configuration
    if (
      !process.env.EMAIL_SERVER_HOST ||
      !process.env.EMAIL_SERVER_USER ||
      !process.env.EMAIL_SERVER_PASSWORD ||
      !process.env.EMAIL_FROM
    ) {
      console.error("❌ Configuration email incomplète. Email non envoyé.");
      return { success: false, message: "Configuration email manquante" };
    }

    // Récupérer l'email de l'admin
    const { connectDB } = await import("@/lib/mongodb");
    await connectDB();
    const User = (await import("@/lib/models/User")).default;
    const admin = await User.findOne({ role: "admin" });

    if (!admin || !admin.email) {
      console.warn(
        "⚠️ Aucun admin trouvé avec un email. Email de notification non envoyé."
      );
      return { success: false, message: "Aucun admin trouvé" };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: admin.email,
      subject: `🔔 Nouvelle réservation - ${booking.activityName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ea5e9;">Nouvelle réservation reçue</h2>
          <p>Bonjour,</p>
          <p>Une nouvelle demande de réservation a été reçue et nécessite votre attention.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Détails de la réservation :</h3>
            <p><strong>Activité :</strong> ${booking.activityName}</p>
            ${booking.activityType ? `<p><strong>Type :</strong> ${booking.activityType === "activity" ? "Activité" : booking.activityType === "tour" ? "Tour" : "Transfert"}</p>` : ""}
            <p><strong>Date :</strong> ${new Date(booking.date).toLocaleDateString("fr-FR")}</p>
            <p><strong>Heure :</strong> ${booking.time}</p>
            <p><strong>Nombre de participants :</strong> ${booking.participants}</p>
            <p><strong>Client :</strong> ${booking.name}</p>
            <p><strong>Email :</strong> ${booking.email}</p>
            ${booking.phone ? `<p><strong>Téléphone :</strong> ${booking.phone}</p>` : ""}
            ${booking.notes ? `<p><strong>Notes :</strong> ${booking.notes}</p>` : ""}
            <p><strong>Statut :</strong> <span style="color: #f59e0b; font-weight: bold;">En attente</span></p>
          </div>
          <p style="margin-top: 20px;">
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/dashboard" 
               style="display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Voir dans le dashboard
            </a>
          </p>
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            Connectez-vous au dashboard admin pour confirmer ou rejeter cette réservation.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email de notification envoyé à l'admin:", admin.email);
    console.log("Message ID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email de notification à l'admin:",
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Détails:", errorMessage);

    // Ne pas bloquer si l'email à l'admin échoue
    return { success: false, error: errorMessage };
  }
}

export async function sendBookingRejectionEmail(booking: BookingEmail) {
  try {
    // Vérifier la configuration
    if (
      !process.env.EMAIL_SERVER_HOST ||
      !process.env.EMAIL_SERVER_USER ||
      !process.env.EMAIL_SERVER_PASSWORD ||
      !process.env.EMAIL_FROM
    ) {
      console.error("❌ Configuration email incomplète. Email non envoyé.");
      throw new Error("Configuration email manquante");
    }

    if (!booking.email) {
      console.error("❌ Email du client manquant dans la réservation");
      throw new Error("Email du client manquant");
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: booking.email,
      subject: `Annulation de réservation - ${booking.activityName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Annulation de votre réservation</h2>
          <p>Bonjour ${booking.name || "Client"},</p>
          <p>Nous sommes désolés de vous informer que votre demande de réservation pour <strong>${
            booking.activityName
          }</strong> n'a pas pu être acceptée.</p>
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Détails de la réservation :</h3>
            <p><strong>Activité :</strong> ${booking.activityName}</p>
            <p><strong>Date :</strong> ${new Date(
              booking.date
            ).toLocaleDateString("fr-FR")}</p>
            <p><strong>Heure :</strong> ${booking.time}</p>
            <p><strong>Nombre de participants :</strong> ${
              booking.participants
            }</p>
          </div>
          <p>N'hésitez pas à nous contacter pour toute question ou pour réserver une autre activité.</p>
          <p>Cordialement,<br>L'équipe Djerba Adventures</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email d'annulation envoyé à", booking.email);
    console.log("Message ID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    console.error("❌ Erreur lors de l'envoi de l'email d'annulation:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Détails:", errorMessage);

    // Message d'erreur plus clair pour Gmail
    if (
      error instanceof Error &&
      ("code" in error || "responseCode" in error)
    ) {
      const emailError = error as { code?: string; responseCode?: number };
      if (emailError.code === "EAUTH" || emailError.responseCode === 535) {
        const friendlyError = new Error(
          "Erreur d'authentification Gmail. Vérifiez que vous utilisez un mot de passe d'application (pas votre mot de passe Gmail normal). Consultez CONFIGURATION-EMAIL.md pour plus d'informations."
        );
        throw friendlyError;
      }
    }

    throw error; // Propager l'erreur pour qu'elle soit visible dans l'API
  }
}
