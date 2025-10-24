import { Post } from '../models/post.models.js';
import { User } from '../models/user.models.js';

// Get single post
export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await Post.findById(id)
      .populate('author', 'username avatar')
      .populate('comments.user', 'username avatar')
      .populate('likes', 'username');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error("Server error occurred:", error);
    res.status(500).json({ message: "Unable to fetch post" });
  }
};

// Get post by slug
export const getPostBySlug = async (req, res) => {
  const slug = req.params.slug;

  try {
    const post = await Post.findOne({ slug })
      .populate('author', 'username avatar bio')
      .populate('comments.user', 'username avatar')
      .populate('likes', 'username');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error("Server error occurred:", error);
    res.status(500).json({ message: "Unable to fetch post" });
  }
};

// Create post
export const createPost = async (req, res) => {
  const userId = req.user.id;
  const { title, content, tags, image, category, isPublished } = req.body;

  try {
    const user = await User.findById(userId);

    const newPost = await Post.create({
      author: user._id,
      title: title,
      content: content,
      tags: tags || [],
      image: image || null,
      category: category || 'other',
      isPublished: isPublished !== undefined ? isPublished : true
    });

    await newPost.populate('author', 'username avatar');
    res.status(201).json({ post: newPost });
  } catch (error) {
    console.error("Error in creating the post", error);
    res.status(500).json({ message: "Unable to create post" });
  }
};

// Get all posts with pagination and filtering
export const getAllPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'newest',
      category,
      tag,
      featured,
      search
    } = req.query;

    const query = { isPublished: true };

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }

    // Filter by featured
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Search in title and content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'oldest':
        sortOptions.createdAt = 1;
        break;
      case 'mostViewed':
        sortOptions.views = -1;
        break;
      case 'mostLiked':
        sortOptions.likes = -1;
        break;
      case 'featured':
        sortOptions.isFeatured = -1;
        sortOptions.createdAt = -1;
        break;
      default: // newest
        sortOptions.createdAt = -1;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOptions,
      populate: {
        path: 'author',
        select: 'username avatar'
      }
    };

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.status(200).json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user's posts
export const getUserPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, draft } = req.query;

    const query = { author: userId };

    // Filter by draft/published status
    if (draft === 'true') {
      query.isPublished = false;
    } else if (draft === 'false') {
      query.isPublished = true;
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.status(200).json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Error getting user's posts:", error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// Get posts by user ID
export const getPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ author: userId, isPublished: true })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments({ author: userId, isPublished: true });

    res.status(200).json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content, tags, image, isPublished, category, isFeatured } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        title,
        content,
        tags: tags || post.tags,
        image: image || post.image,
        isPublished: isPublished !== undefined ? isPublished : post.isPublished,
        category: category || post.category,
        isFeatured: isFeatured !== undefined ? isFeatured : post.isFeatured,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('author', 'username avatar');

    res.status(200).json({ post: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Unable to update post" });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Unable to delete post" });
  }
};

// Like/Unlike post
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked the post
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike the post
      post.likes = post.likes.filter(like => like.toString() !== userId);
    } else {
      // Like the post
      post.likes.push(userId);
    }

    await post.save();
    await post.populate('likes', 'username');

    res.status(200).json({
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes.length,
      liked: !alreadyLiked
    });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Unable to like post" });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: userId,
      text: text.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the user info in comments
    await post.populate('comments.user', 'username avatar');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1],
      totalComments: post.comments.length
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Unable to add comment" });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is the post author
    if (comment.user.toString() !== userId && post.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    post.comments.pull(commentId);
    await post.save();

    res.status(200).json({
      message: 'Comment deleted successfully',
      totalComments: post.comments.length
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Unable to delete comment" });
  }
};

// Increment views
export const incrementViews = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ views: post.views });
  } catch (error) {
    console.error("Error incrementing views:", error);
    res.status(500).json({ message: "Unable to update views" });
  }
};

// Search posts
export const searchPosts = async (req, res) => {
  try {
    const { q, tag, category, author, sortBy = 'newest', page = 1, limit = 10 } = req.query;

    let query = { isPublished: true };

    // Search by keyword
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ];
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by author username
    if (author) {
      const users = await User.find({ username: { $regex: author, $options: 'i' } });
      const userIds = users.map(user => user._id);
      query.author = { $in: userIds };
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'oldest':
        sortOptions.createdAt = 1;
        break;
      case 'mostViewed':
        sortOptions.views = -1;
        break;
      case 'mostLiked':
        sortOptions.likes = -1;
        break;
      default: // newest
        sortOptions.createdAt = -1;
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.status(200).json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    });
  } catch (error) {
    console.error("Error searching posts:", error);
    res.status(500).json({ message: "Unable to search posts" });
  }
};

// Get popular posts
export const getPopularPosts = async (req, res) => {
  try {
    const { limit = 5, timeframe = 'all' } = req.query;

    let dateFilter = {};
    const now = new Date();

    switch (timeframe) {
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
        break;
      case 'year':
        dateFilter = { createdAt: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
        break;
      // 'all' - no date filter
    }

    const query = { isPublished: true, ...dateFilter };

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .sort({ views: -1, likes: -1 })
      .limit(parseInt(limit));

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Error fetching popular posts:", error);
    res.status(500).json({ message: "Unable to fetch popular posts" });
  }
};

// Get posts by tags
export const getPostsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({
      isPublished: true,
      tags: { $in: [tag.toLowerCase()] }
    })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments({
      isPublished: true,
      tags: { $in: [tag.toLowerCase()] }
    });

    res.status(200).json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      tag
    });
  } catch (error) {
    console.error("Error fetching posts by tag:", error);
    res.status(500).json({ message: "Unable to fetch posts" });
  }
};

// Get all tags
export const getAllTags = async (req, res) => {
  try {
    const tags = await Post.aggregate([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);

    res.status(200).json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Unable to fetch tags" });
  }
};

// Toggle featured status (Admin only)
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isFeatured = !post.isFeatured;
    await post.save();

    res.status(200).json({
      message: `Post ${post.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      isFeatured: post.isFeatured
    });
  } catch (error) {
    console.error("Error toggling featured status:", error);
    res.status(500).json({ message: "Unable to update featured status" });
  }
};
