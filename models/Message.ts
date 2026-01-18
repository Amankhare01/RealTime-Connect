import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  senderId: string;
  receiverId: string;
  text?: string;
  fileUrl?: string;
  fileType?: "image" | "audio" | "document";
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String },
    fileUrl: { type: String },
    fileType: {
      type: String,
      enum: ["image", "audio", "document"],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
