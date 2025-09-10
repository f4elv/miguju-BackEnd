import jwt from "jsonwebtoken";

export function autenticateToken(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) return res.status(401).json({ erro: "Token não fornecido" });

	jwt.verify(token, process.env.JWT_SECRET, (erro, user) => {
		if (erro) return res.status(401).json({ erro: "Token inválido ou expirado" });
		req.user = user;
		next();
	});
}
