// src/config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
  
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      // These options are deprecated in Mongoose 7+, but OK to keep for older versions
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(process.env.MONGO_URL);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
