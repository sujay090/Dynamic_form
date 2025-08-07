import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionString = `${process.env.MONGODB_URI}/${DB_NAME}`;
    console.log("🔗 Attempting to connect to:", connectionString);
    
    const connectionInstance = await mongoose.connect(connectionString);
    console.log(
      `✅ Connected to database: ${connectionInstance.connection.host} `
    );
  } catch (error) {
    console.log("MONGODB connection error: " + error);
    process.exit(1);
  }
};

export default connectDB;
