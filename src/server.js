import express from "express";
import dotenv from "dotenv";

import adminRouter from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/admin", adminRouter);

app.listen(process.env.PORT, () => {
	console.log("server is running on port 3000");
});
