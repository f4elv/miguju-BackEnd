import express from "express";
import upload from "../utils/multer.js";
import { autenticateToken } from "../middlewares/auth.js";
import { login, createAmigurumi, listAmigurumis, getAmigurumi, deleteAmigurumi, updateAmigurumi } from "../controllers/adminController.js";
import { createCategory, deleteCategory, listCategories } from "../controllers/adminController.js";

const adminRouter = express.Router();

// Login
adminRouter.post("/login", login);

// Rotas Amigurumis
adminRouter.post("/amigurumi", autenticateToken, upload.array("fotos", 5), createAmigurumi);
adminRouter.put("/amigurumi/:id", autenticateToken, upload.array("fotos", 5), updateAmigurumi);
adminRouter.get("/amigurumis", autenticateToken, listAmigurumis);
adminRouter.get("/amigurumi/:id", autenticateToken, getAmigurumi);
adminRouter.delete("/amigurumi/:id", autenticateToken, deleteAmigurumi);

// Rotas Categorias
adminRouter.post("/categoria", autenticateToken, createCategory);
adminRouter.delete("/categoria/:id", autenticateToken, deleteCategory);
adminRouter.get("/categorias", autenticateToken, listCategories);

export default adminRouter;
