import mongoose, { Schema, Document } from "mongoose";

export interface IRegistration extends Document {
  userId: string;
  name: string;
  rollNo: string;
  labNo: string;
  systemNo: string;
  timestamp: Date;
  machineId: string;
}

const RegistrationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  rollNo: { type: String, required: true },
  labNo: { type: String, required: true },
  systemNo: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  machineId: { type: String, required: true },
});

export default mongoose.model<IRegistration>("Registration", RegistrationSchema);
