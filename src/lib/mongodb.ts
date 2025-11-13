import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  const errorMsg =
    process.env.NODE_ENV === "production"
      ? "⚠️ MONGO_URI is not defined. Please add it to Vercel Environment Variables."
      : "⚠️ Please add your MongoDB URI to .env.local";
  throw new Error(errorMsg);
}

// Vérifier si c'est localhost en production
if (process.env.NODE_ENV === "production" && MONGO_URI.includes("localhost")) {
  console.error("❌ ERREUR CRITIQUE: Vous utilisez localhost en production !");
  console.error("❌ Vercel ne peut pas accéder à localhost.");
  console.error("❌ Vous DEVEZ utiliser MongoDB Atlas (cloud).");
  console.error("❌ Consultez GUIDE-MONGODB-ATLAS.md pour la configuration.");
  throw new Error(
    "MONGO_URI ne peut pas être localhost en production. Utilisez MongoDB Atlas."
  );
}

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);

    // Messages d'erreur plus clairs
    if (error instanceof Error) {
      if (error.message.includes("bad auth")) {
        console.error(
          "❌ Erreur d'authentification MongoDB. Vérifiez username/password."
        );
      } else if (error.message.includes("IP")) {
        console.error(
          "❌ Votre IP n'est pas autorisée. Vérifiez Network Access dans MongoDB Atlas."
        );
      } else if (error.message.includes("timeout")) {
        console.error(
          "❌ Timeout de connexion. Vérifiez que votre cluster MongoDB Atlas est démarré."
        );
      }
    }

    // Ne pas bloquer l'application, mais logger l'erreur
    throw error;
  }
};
