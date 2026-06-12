import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  image: { type: String, required: false },
  provider: { type: String, required: false },
  providerId: { type: String, required: false }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);