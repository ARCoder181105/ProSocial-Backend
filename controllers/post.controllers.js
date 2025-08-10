import {Post} from '../models/post.models.js';
import {User} from '../models/user.models.js';

export const getPost = async (req, res) => {
    const id = req.params.id;

    try {
        const post = await Post.findById(id).populate('author', 'username');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        return res.status(200).json({ post });
    } catch (error) {
        console.error("Server error occurred:", error);
        res.status(500).json({ message: "Unable to fetch post" });
    }
};

export const createPost = async (req, res) => {
    const userId = req.user.id;
    const { title, content } = req.body;

    try {
        const user = await User.findById(userId);

        const newPost = await Post.create({
            author: user._id,
            title: title,
            content: content,
        });
        res.status(201).json({ post: newPost });
    } catch (error) {
        console.error("Error in creating the post",error)
         res.status(500).json({ message: "Unable to create post" });
    }



};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({ posts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const userId = req.user.id;

        const posts = await Post.find({ author: userId })
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({ posts });
    } catch (error) {
        console.error("Error getting user's posts:", error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
};

export const getPostsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const posts = await Post.find({ author: userId })
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({ posts });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
};