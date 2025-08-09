import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please enter title']
    },
    content: {
      type: String,
      required: [true, 'Please provide some content']
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
