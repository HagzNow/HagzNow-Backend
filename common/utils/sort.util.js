"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySorting = applySorting;
function applySorting(query, orderBy, alias) {
    Object.entries(orderBy).forEach(([key, direction]) => {
        const column = alias ? `${alias}.${key}` : key;
        query.addOrderBy(column, direction);
    });
    return query;
}
//# sourceMappingURL=sort.util.js.map