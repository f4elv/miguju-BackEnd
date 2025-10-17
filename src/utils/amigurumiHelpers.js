export function normalizeCategories(categories) {
	if (!Array.isArray(categories)) return [];
	return [...new Set(categories.map((c) => c.trim().toLowerCase()).filter((c) => c.length > 0))];
}

export function parseJSONSafe(str) {
	if (!str) return [];
	try {
		const parsed = JSON.parse(str);
		if (Array.isArray(parsed)) return parsed;
		return [];
	} catch {
		return [];
	}
}

export function mapCategoriesForPrisma(categories) {
	return categories.map((name) => ({
		where: { name },
		create: { name },
	}));
}

export function mapCategoryIds(ids) {
	return ids.map((id) => ({ id: Number(id) }));
}
