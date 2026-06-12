import mongoose, { Schema } from 'mongoose';

const BookmarkSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  ogImage: { type: String },
  tags: [{ type: String }],
  isFavorite: { type: Boolean, default: false }
}, { timestamps: true });

// Export the model, similar to the User model
export const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', BookmarkSchema);