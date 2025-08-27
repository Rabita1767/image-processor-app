import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const databaseConnection = async (callback: () => void): Promise<void> => {
  try {
    if (process.env.DATABASE_URL) {
      const exist = await mongoose.connect(process.env.DATABASE_URL);
      if (exist) {
        console.log("Database connection is successful");
        callback();
      } else {
        console.log("Database connection is not successful");
      }
    } else {
      console.log("Database connection is not successful");
    }
  } catch (error) {
    console.error("Database connection error:", error);
  }
};
export default databaseConnection;
