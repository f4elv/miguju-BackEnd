export function buildPaginationQuery(query) {
	let { page = 1, limit = 20, search = "", categories } = query;
	page = Number(page);
	limit = Number(limit);

	const where = {};

	if (search) {
		where.name = { contains: search, mode: "insensitive" };
	}

	if (categories) {
		const categoryIds = categories.split(",").map(Number).filter(Boolean);
		if (categoryIds.length) {
			where.category = { some: { id: { in: categoryIds } } };
		}
	}

	const skip = (page - 1) * limit;
	const take = limit;

	return { where, skip, take, page, limit };
}
