import prisma from "../client/prisma.js";
import { buildPaginationQuery } from "../utils/paginationHelper.js";

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

export async function getAmigurumi(req, res) {
	try {
		const { id } = req.params;
		const amigurumi = await prisma.amigurumi.findUnique({
			where: { id: Number(id) },
			include: { fotos: true, category: true },
		});
		if (!amigurumi) return res.status(404).json({ erro: "Amigurumi não encontrado" });
		res.status(200).json({ amigurumi });
	} catch (erro) {
		console.error(erro);
		res.status(500).json({ erro: "Erro ao buscar amigurumi" });
	}
}

export async function listAmigurumisByCategory(req, res) {
	try {
		const { id } = req.params;
		let { page = 1, limit = 20, search = "" } = req.query;
		page = Number(page);
		limit = Number(limit);

		const amigurumis = await prisma.amigurumi.findMany({
			where: {
				category: { some: { id: Number(id) } },
				name: { contains: search, mode: "insensitive" },
			},
			include: { fotos: true, category: true },
			skip: (page - 1) * limit,
			take: limit,
		});

		const total = await prisma.amigurumi.count({
			where: {
				category: { some: { id: Number(id) } },
				name: { contains: search, mode: "insensitive" },
			},
		});

		res.status(200).json({ amigurumis, page, limit, total });
	} catch (erro) {
		console.error(erro);
		res.status(500).json({ erro: "Erro ao listar amigurumis por categoria" });
	}
}
