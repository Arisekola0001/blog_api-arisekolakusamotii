const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    tags: { type: [String], default: [] },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    state: { type: String, enum: ['draft', 'published'], default: 'draft' },
    read_count: { type: Number, default: 0 },
    reading_time: { type: String }
  },
  { timestamps: true }
);


blogSchema.pre('save', function (next) {
  const wordsPerMinute = 200;
  const words = this.body?.split(/\s+/).length || 0;
  const minutes = Math.ceil(words / wordsPerMinute);
  this.reading_time = `${minutes} min read`;
  next();
});

module.exports = mongoose.model('Blog', blogSchema);