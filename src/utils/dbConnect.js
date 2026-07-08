import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const dbConnect = async () => {
    const db = process.env.MONGODB_URI;

    if (!db) {
        throw new Error('MONGODB_URI is missing in environment variables');
    }

    await mongoose.connect(db)
        .then(() => console.log('Connected to MongoDB...'))
        .catch((err) => {
            console.error('Could not connect to MongoDB...', err);
            throw err;
        });
};

export default dbConnect;
