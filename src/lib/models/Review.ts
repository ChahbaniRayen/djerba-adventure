import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  activityId: string;
  activityType: "activity" | "tour" | "transfer";
  rating: number;
  comment: string;
  userName: string;
  userEmail: string;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityId: {
      type: String,
      required: true,
    },
    activityType: {
      type: String,
      enum: ["activity", "tour", "transfer"],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances
ReviewSchema.index({ activityId: 1, approved: 1 });
ReviewSchema.index({ userId: 1 });

export default mongoose.models.Review ||
  mongoose.model<IReview>("Review", ReviewSchema);
