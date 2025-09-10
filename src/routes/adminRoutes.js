import express from "express";
import upload from "../utils/multer.js";
import { autenticateToken } from "../middlewares/auth.js";
import { login, createAmigurumi, listAmigurumis, getAmigurumi, deleteAmigurumi, updateAmigurumi } from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.post("/login", login);
adminRouter.post("/amigurumi", upload.array("fotos", 5), createAmigurumi);
adminRouter.get("/amigurumis", listAmigurumis);
adminRouter.get("/amigurumi/:id", getAmigurumi);
adminRouter.delete("/amigurumi/:id", deleteAmigurumi);
adminRouter.put("/amigurumi/:id", upload.array("fotos", 5), updateAmigurumi);

export default adminRouter;
