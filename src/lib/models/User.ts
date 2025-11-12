import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  role: "user" | "admin";
  provider: "google" | "apple" | "email" | "credentials";
  providerId?: string;
  password?: string;
  emailVerified?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      // SUPPRIMÉ: default: "user" pour éviter qu'il soit réappliqué
      // Le rôle sera défini explicitement lors de la création
    },
    provider: {
      type: String,
      enum: ["google", "apple", "email", "credentials"],
      required: true,
    },
    providerId: {
      type: String,
    },
    password: {
      type: String,
      select: false, // Ne pas retourner le mot de passe par défaut
    },
    emailVerified: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpires: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances (email a déjà un index unique via unique: true)
UserSchema.index({ providerId: 1 });

// Hook pre-save pour PRÉSERVER le rôle admin lors des mises à jour
UserSchema.pre("save", async function (next) {
  // Si c'est une mise à jour (pas une création)
  if (!this.isNew) {
    try {
      // Vérifier dans la base de données le rôle actuel
      const UserModel = this.constructor as mongoose.Model<IUser>;
      const existingUser = await UserModel.findOne({ _id: this._id }).select(
        "role email"
      );

      // Si l'utilisateur a le rôle admin dans la base, le préserver
      if (existingUser && existingUser.role === "admin") {
        // Forcer le rôle à rester "admin" même si quelque chose essaie de le changer
        this.role = "admin";
        console.log(
          `[USER MODEL] Protection pre-save: Rôle admin préservé pour ${existingUser.email || this.email}`
        );
      }
    } catch (error) {
      // En cas d'erreur, continuer quand même
      console.error("[USER MODEL] Erreur dans pre-save hook:", error);
    }
  }
  next();
});

// Utiliser une collection séparée pour éviter les conflits avec NextAuth
// NextAuth utilise "users", notre modèle utilise "app_users"
export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema, "app_users");
