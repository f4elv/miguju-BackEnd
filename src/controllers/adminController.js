import jwt from "jsonwebtoken";
import uploadFromBuffer from "../utils/uploadBuffer.js";
import prisma from "../client/prisma.js";
import cloudinary from "../config/cloudinary.js";

export async function login(req, res) {
	const { password } = req.body;
	if (!password) return res.status(401).json({ erro: "Senha não enviada" });

	try {
		if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ erro: "Senha incorreta" });

		const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "5h" });
		return res.status(200).json({ message: "Login efetuado com sucesso", token: token });
	} catch (erro) {
		return res.status(401).json({ erro: "Erro ao realizar login" });
	}
}

export async function createAmigurumi(req, res) {
	try {
		const { name, description, category } = req.body;

		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ erro: "nenhuma foto enviada" });
		}

		const upload_results = await Promise.all(req.files.map((file) => uploadFromBuffer(file.buffer)));

		const fotos = upload_results.map((result) => ({ url: result.secure_url }));
		const amigurumi = await prisma.amigurumi.create({
			data: {
				name,
				description,
				fotos: { create: fotos },
				category: {
					connectOrCreate: category.split(",").map((name) => ({
						where: { name },
						create: { name },
					})),
				},
			},
			include: { fotos: true, category: true },
		});

		res.status(201).json({ message: "Amigurumi criado com sucesso", amigurumi });
	} catch (erro) {
		console.error(erro);
		res.status(500).json({ error: "Erro ao criar amigurumi" });
	}
}

export async function listAmigurumis(req, res) {
	const amigurumis = await prisma.amigurumi.findMany({
		include: { fotos: true, category: true },
	});
	res.status(200).json({ amigurumis });
}

export async function getAmigurumi(req, res) {
	const { id } = req.params;
	const amigurumi = await prisma.amigurumi.findUnique({
		where: { id: Number(id) },
		include: { fotos: true, category: true },
	});
	if (!amigurumi) return res.status(404).json({ erro: "Amigurumi não encontrado" });
	res.status(200).json(amigurumi);
}

export async function deleteAmigurumi(req, res) {
	const { id } = req.params;
	await prisma.foto.deleteMany({ where: { amigurumiId: Number(id) } });
	await prisma.amigurumi.delete({ where: { id: Number(id) } });
	res.json({ mensagem: "Amigurumi deletado com sucesso" });
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
		if (name) dataUpdate.name = name;
		if (description) dataUpdate.description = description;

		const categoryUpdate = {};
		if (removeCategory) {
			const categories = JSON.parse(removeCategory); // array de IDs
			categoryUpdate.disconnect = categories.map((id) => ({ id: Number(id) }));
		}
		if (addCategory) {
			const categories = JSON.parse(addCategory); // array de IDs
			categoryUpdate.connect = categories.map((id) => ({ id: Number(id) }));
		}
		if (Object.keys(categoryUpdate).length > 0) {
			dataUpdate.category = categoryUpdate;
		}

		const fotosUpdate = {};
		if (removeFotos) {
			const fotos = JSON.parse(removeFotos); // array de public_id
			for (const publicId of fotos) {
				await cloudinary.uploader.destroy(publicId);
			}
			fotosUpdate.deleteMany = fotos.map((id) => ({ id }));
		}

		if (req.files && req.files.length > 0) {
			const upload_results = await Promise.all(req.files.map((file) => uploadFromBuffer(file.buffer)));
			const fotos = upload_results.map((result) => ({ url: result.secure_url }));
			fotosUpdate.create = fotos;
		}

		if (Object.keys(fotosUpdate).length > 0) {
			dataUpdate.fotos = fotosUpdate;
		}

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
