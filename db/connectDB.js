import mongoose from "mongoose";
import { DB_NAME } from '../constants.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
  } catch (error) {
    console.log("❌ Error in connect:", error.message);
    throw error;
  }
};