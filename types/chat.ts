/* ================= USER ================= */
export interface User {
  _id: string;            // ✅ MongoDB id
  fullName: string;
  email: string;
  profilePic?: string;   // Cloudinary / uploaded image URL
  createdAt?: string;
  updatedAt?: string;
}

/* ================= MESSAGE ================= */
export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;

  text?: string;

  fileUrl?: string;
  fileType?: "image" | "audio" | "document";

  createdAt: string;
}
