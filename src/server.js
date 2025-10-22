import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

const origin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
	cors({
		origin: origin,
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	})
);

app.use("/api/admin", adminRouter);
app.use("/api/users", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
