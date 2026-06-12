import mongoose, { Schema } from 'mongoose';

const CollectionSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
}, { timestamps: true });

export const Collection = mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);
