import mongoose, { Schema, Document } from "mongoose";

export interface IClassStructure extends Document {
  name: string;
  monthlyFee: number;
}

const ClassStructureSchema = new Schema<IClassStructure>(
  {
    name: { type: String, required: true, unique: true },
    monthlyFee: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.ClassStructure || mongoose.model<IClassStructure>("ClassStructure", ClassStructureSchema);
