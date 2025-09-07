import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  dob: Date;
  role: 'student' | 'faculty' | 'admin';
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  dob: { type: Date, required: true },
  role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
