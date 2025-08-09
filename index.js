import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './db/connectDB.js';
import userRoutes from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'
import dotenv from 'dotenv';
dotenv.config();


const PORT = process.env.PORT;
const app = express();

//middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',userRoutes);
app.use('/api/post',postRoutes);


connectDB()
    .then(() => {
        console.log("✅MongoDB Connected");
        app.listen(PORT, () => {
            console.log(`🚀 Server Started on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err);
        process.exit(1);
    })


