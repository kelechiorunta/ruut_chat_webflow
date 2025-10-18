import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('Error connecting to DB:', err);
    process.exit(1);
  }
};
