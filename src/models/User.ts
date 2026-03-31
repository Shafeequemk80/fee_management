import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string; // Used for admin login or student admission number
  password?: string;
  role: "admin" | "student";
  studentId?: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["admin", "student"], default: "student" },
    studentId: { type: Schema.Types.ObjectId, ref: "Student" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
