import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { initializeAdminUsers } from "./utils/initializeAdminUsers.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(async () => {
    // Initialize admin users after database connection
    await initializeAdminUsers();
    
    app.listen(process.env.PORT || 4000, () => {
      console.log(` listening on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongodb connection failed: " + err);
  });
