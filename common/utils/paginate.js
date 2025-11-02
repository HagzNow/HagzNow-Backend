"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = paginate;
const typeorm_1 = require("typeorm");
async function paginate(repoOrQuery, paginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;
    let data = [];
    let total = 0;
    if (repoOrQuery instanceof typeorm_1.Repository) {
        [data, total] = await repoOrQuery.findAndCount({
            skip,
            take: limit,
        });
    }
    else {
        [data, total] = await repoOrQuery.skip(skip).take(limit).getManyAndCount();
    }
    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
//# sourceMappingURL=paginate.js.map