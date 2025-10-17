import z from "zod";

export const validate = (schema) => (req, res, next) => {
	try {
		req.body = schema.parse(req.body);
		next();
	} catch (erro) {
		if (erro instanceof z.ZodError) {
			return res.status(400).json({ errors: erro.errors });
		}
		next(erro);
	}
};
