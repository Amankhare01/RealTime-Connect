import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  senderId: string;
  receiverId: string;
  text?: string;
  fileUrl?: string;
  fileType?: "image" | "audio" | "document";
  reactions?: Map<string, string>;
  status?: "sent" | "delivered" | "read";
  isEdited?: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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
    reactions: {
      type: Map,
      of: String,
      default: {},
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);

