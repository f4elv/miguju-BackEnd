import jwt from "jsonwebtoken";
import prisma from "../client/prisma.js";
import uploadFromBuffer from "../utils/uploadBuffer.js";
import cloudinary from "../config/cloudinary.js";

import { normalizeCategories, parseJSONSafe, mapCategoriesForPrisma, mapCategoryIds } from "../utils/amigurumiHelpers.js";
import { buildPaginationQuery } from "../utils/paginationHelper.js";

// LOGIN
export async function login(req, res) {
	const { password } = req.body;
	if (!password) return res.status(400).json({ erro: "Senha não enviada" });

	try {
		if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ erro: "Senha incorreta" });

		const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "5h" });
		return res.status(200).json({ message: "Login efetuado com sucesso", token });
	} catch (erro) {
		return res.status(401).json({ erro: "Erro ao realizar login" });
	}
}

// =========================
// CRUD AMIGURUMIS
// =========================
export async function createAmigurumi(req, res) {
	try {
		let { name, description, category } = req.body;

		if (!name) return res.status(400).json({ erro: "O campo Nome é obrigatório" });
		if (!description) return res.status(400).json({ erro: "O campo Descrição é obrigatório" });
		if (!category) return res.status(400).json({ erro: "Nenhuma categoria selecionada" });

		category = normalizeCategories(parseJSONSafe(category));

		if (!req.files || req.files.length === 0) return res.status(400).json({ erro: "Nenhuma foto enviada" });

		const fotos = await Promise.all(
			req.files.map(async (file) => {
				const result = await uploadFromBuffer(file.buffer);
				return { url: result.secure_url };
			})
		);

		const amigurumi = await prisma.amigurumi.create({
			data: {
				name,
				description,
				fotos: { create: fotos },
				category: {
					connectOrCreate: mapCategoriesForPrisma(category),
				},
			},
			include: { fotos: true, category: true },
		});

		res.status(201).json({ message: "Amigurumi criado com sucesso", amigurumi });
	} catch (erro) {
		console.error(erro);
		res.status(500).json({ erro: "Erro ao criar amigurumi" });
	}
}

export async function updateAmigurumi(req, res) {
	try {
		const { id } = req.params;
		const { name, description, addCategory, removeCategory, removeFotos } = req.body;

		let amigurumi = await prisma.amigurumi.findUnique({
			where: { id: Number(id) },
			include: { category: true, fotos: true },
		});

		if (!amigurumi) return res.status(404).json({ erro: "Amigurumi não encontrado" });

		const dataUpdate = {};
		if (name !== undefined) dataUpdate.name = name;
		if (description !== undefined) dataUpdate.description = description;

		const categoryUpdate = {};
		const addCats = normalizeCategories(parseJSONSafe(addCategory));
		const removeCats = parseJSONSafe(removeCategory);

		if (addCats.length > 0) categoryUpdate.connectOrCreate = mapCategoriesForPrisma(addCats);
		if (removeCats.length > 0) categoryUpdate.disconnect = mapCategoryIds(removeCats);

		if (Object.keys(categoryUpdate).length > 0) dataUpdate.category = categoryUpdate;

		const fotosUpdate = {};
		const removeFotosArr = parseJSONSafe(removeFotos);
		if (removeFotosArr.length > 0) {
			await Promise.all(removeFotosArr.map((publicId) => cloudinary.uploader.destroy(publicId)));
			fotosUpdate.deleteMany = removeFotosArr.map((id) => ({ id }));
		}

		if (req.files && req.files.length > 0) {
			const newFotos = await Promise.all(
				req.files.map(async (file) => {
					const result = await uploadFromBuffer(file.buffer);
					return { url: result.secure_url };
				})
			);
			fotosUpdate.create = newFotos;
		}

		if (Object.keys(fotosUpdate).length > 0) dataUpdate.fotos = fotosUpdate;

		// update
		amigurumi = await prisma.amigurumi.update({
			where: { id: Number(id) },
			data: dataUpdate,
			include: { category: true, fotos: true },
		});

		res.status(200).json({ message: "Amigurumi atualizado com sucesso", amigurumi });
	} catch (erro) {
		console.error(erro);
		res.status(500).json({ erro: "Erro ao atualizar amigurumi" });
	}
}

export async function deleteAmigurumi(req, res) {
	try {
		const { id } = req.params;
		if (!id) return res.status(400).json({ erro: "Amigurumi não selecionado" });

		console.log("🗑️ Iniciando delete do amigurumi ID:", id);

		// Usar transação para garantir que tudo seja feito ou nada
		await prisma.$transaction(async (tx) => {
			// 1. Desconectar categorias
			await tx.amigurumi.update({
				where: { id: Number(id) },
				data: { category: { set: [] } },
			});

			// 2. Deletar fotos
			await tx.foto.deleteMany({
				where: { amigurumiId: Number(id) },
			});

			// 3. Deletar amigurumi
			await tx.amigurumi.delete({
				where: { id: Number(id) },
			});
		});

		console.log("✅ Amigurumi deletado com sucesso");
		res.status(200).json({ mensagem: "Amigurumi deletado com sucesso" });
	} catch (erro) {
		console.error("❌ ERRO:", erro.message);

		if (erro.code === "P2025") {
			return res.status(404).json({ erro: "Amigurumi não encontrado" });
		}

		res.status(500).json({ erro: "Erro ao deletar amigurumi" });
	}
}

export async function listAmigurumis(req, res) {
	try {
		const { where, skip, take, page, limit } = buildPaginationQuery(req.query);

		const amigurumis = await prisma.amigurumi.findMany({
			where,
			include: { fotos: true, category: true },
			skip,
			take,
		});

		const total = await prisma.amigurumi.count({ where });

		res.status(200).json({ amigurumis, page, limit, total });
	} catch (erro) {
		console.error(erro);
		res.status(500).json({ erro: "Erro ao listar amigurumis" });
	}
}
export async function getAmigurumi(req, res) {
	try {
		const { id } = req.params;
		const amigurumi = await prisma.amigurumi.findUnique({
			where: { id: Number(id) },
			include: { fotos: true, category: true },
		});
		if (!amigurumi) return res.status(404).json({ erro: "Amigurumi não encontrado" });
		res.status(200).json(amigurumi);
	} catch (erro) {
		console.error(erro);
		res.status(500).json({ erro: "Erro ao buscar amigurumi" });
	}
}

// =========================
// CRUD CATEGORIES
// =========================
export async function createCategory(req, res) {
	try {
		const { name } = req.body;
		if (!name) return res.status(401).json({ erro: "O campo Nome é obrigatório" });

		const existing = await prisma.category.findUnique({ where: { name } });
		if (existing) return res.status(400).json({ erro: "Categoria já cadastrada" });

		const categoria = await prisma.category.create({ data: { name } });
		res.status(201).json({ message: "Categoria criada com sucesso", categoria });
	} catch (erro) {
		console.error(erro);
		res.status(500).json({ erro: "Erro ao criar categoria" });
	}
}

export async function deleteCategory(req, res) {
	try {
		const id = Number(req.params.id);
		if (!id) return res.status(404).json({ erro: "Categoria não selecionada" });

		const category = await prisma.category.findUnique({ where: { id } });
		if (!category) return res.status(404).json({ erro: "Categoria não encontrada" });

		const amigurumis = await prisma.amigurumi.findMany({
			where: { category: { some: { id } } },
			select: { id: true },
		});
		const updates = amigurumis.map((a) =>
			prisma.amigurumi.update({
				where: { id: a.id },
				data: { category: { disconnect: { id } } },
			})
		);

		await prisma.$transaction(updates);

		await prisma.category.delete({ where: { id } });

		res.status(200).json({ message: "Categoria deletada com sucesso", category });
	} catch (erro) {
		console.error(erro);
		res.status(500).json({ erro: "Erro ao deletar categoria" });
	}
}
export async function listCategories(req, res) {
	try {
		let { page = 1, limit = 20, search = "" } = req.query;
		page = Number(page);
		limit = Number(limit);

		const where = {};
		if (search) where.name = { contains: search, mode: "insensitive" };

		const categories = await prisma.category.findMany({
			where,
			skip: (page - 1) * limit,
			take: limit,
		});

		const total = await prisma.category.count({ where });

		res.status(200).json({ categories, page, limit, total });
	} catch (erro) {
		console.error(erro);
		res.status(500).json({ erro: "Erro ao listar categorias" });
	}
}
