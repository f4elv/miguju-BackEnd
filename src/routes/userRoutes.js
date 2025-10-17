import express from "express";
import { listAmigurumis, getAmigurumi, listAmigurumisByCategory, listCategories } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/amigurumis", listAmigurumis);
userRouter.get("/amigurumis/:id", getAmigurumi);
userRouter.get("/category/:id/amigurumis", listAmigurumisByCategory);
userRouter.get("/categories", listCategories);

export default userRouter;
