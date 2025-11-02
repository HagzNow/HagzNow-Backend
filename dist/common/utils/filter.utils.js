"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFilters = applyFilters;
function applyFilters(query, filters, alias) {
    Object.entries(filters).forEach(([key, value], index) => {
        if (value === undefined || value === null || value === '')
            return;
        const paramName = `${key}_${index}`;
        const column = alias ? `${alias}.${key}` : key;
        const isUuid = typeof value === 'string' &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
        if (typeof value === 'string' && !isUuid) {
            query.andWhere(`${column} ILIKE :${paramName}`, {
                [paramName]: `%${value}%`,
            });
        }
        else {
            query.andWhere(`${column} = :${paramName}`, { [paramName]: value });
        }
    });
    return query;
}
//# sourceMappingURL=filter.utils.js.map