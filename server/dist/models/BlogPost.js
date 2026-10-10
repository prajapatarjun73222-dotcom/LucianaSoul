import { Schema, model } from 'mongoose';
export const BLOG_CATEGORIES = [
    'design-stories',
    'up-cycling',
    'fabric-stories',
    'bespoke',
    'behind-the-scenes',
    'london',
];
const blogSchema = new Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    coverMedia: { type: Schema.Types.ObjectId, ref: 'Media' },
    category: { type: String, enum: BLOG_CATEGORIES, default: 'design-stories' },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
}, { timestamps: true });
blogSchema.pre('save', function (next) {
    if (this.published && !this.publishedAt)
        this.publishedAt = new Date();
    next();
});
export const BlogPost = model('BlogPost', blogSchema);
