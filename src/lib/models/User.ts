import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  role: "user" | "admin";
  provider: "google" | "apple" | "email";
  providerId?: string;
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
      default: "user",
    },
    provider: {
      type: String,
      enum: ["google", "apple", "email"],
      required: true,
    },
    providerId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances (email a déjà un index unique via unique: true)
UserSchema.index({ providerId: 1 });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
