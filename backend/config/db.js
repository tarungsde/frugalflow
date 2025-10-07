import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/FrugalFlow");
    console.log("MongoDB Connected.");
  } catch (error) {
    console.error("Error while connecting to DB:", error);    
    process.exit(1);
  }
}

export default connectDB;