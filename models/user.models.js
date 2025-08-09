import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter your user name'],
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
    },
    about: {
        type: String,
    }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema)