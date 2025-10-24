import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please enter title"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },
    content: {
      type: String,
      required: [true, "Please provide some content"],
      trim: true,
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"]
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      },
    ],
    image: {
      type: String, // URL of post image
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // who liked the post
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: [1000, "Comment cannot exceed 1000 characters"]
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number, // in minutes
      default: 0,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true
    },
    category: {
      type: String,
      enum: ['technology', 'lifestyle', 'travel', 'food', 'health', 'education', 'business', 'entertainment', 'other'],
      default: 'other'
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Index for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ isPublished: 1, createdAt: -1 });
postSchema.index({ title: 'text', content: 'text' });

// Pre-save middleware to generate excerpt and read time
postSchema.pre('save', function(next) {
  // Generate excerpt from content
  if (this.content && !this.excerpt) {
    this.excerpt = this.content.substring(0, 250) + (this.content.length > 250 ? '...' : '');
  }
  
  // Calculate read time (assuming 200 words per minute)
  const wordCount = this.content ? this.content.split(/\s+/).length : 0;
  this.readTime = Math.ceil(wordCount / 200);
  
  // Generate slug from title
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);
  }
  
  next();
});

export const Post = mongoose.model("Post", postSchema);
