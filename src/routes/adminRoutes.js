import express from "express";
import upload from "../utils/multer.js";
import { autenticateToken } from "../middlewares/auth.js";
import { login, createAmigurumi, listAmigurumis, getAmigurumi, deleteAmigurumi, updateAmigurumi } from "../controllers/adminController.js";
import { createCategory, deleteCategory, listCategories } from "../controllers/adminController.js";

const adminRouter = express.Router();

// Login
adminRouter.post("/login", login);

// Rotas Amigurumis
adminRouter.post("/amigurumis", autenticateToken, upload.array("fotos", 5), createAmigurumi);
adminRouter.put("/amigurumis/:id", autenticateToken, upload.array("fotos", 5), updateAmigurumi);
adminRouter.get("/amigurumis", autenticateToken, listAmigurumis);
adminRouter.get("/amigurumis/:id", autenticateToken, getAmigurumi);
adminRouter.delete("/amigurumis/:id", autenticateToken, deleteAmigurumi);

// Rotas Categorias
adminRouter.post("/categories", autenticateToken, createCategory);
adminRouter.delete("/categories/:id", autenticateToken, deleteCategory);
adminRouter.get("/categories", autenticateToken, listCategories);

export default adminRouter;
