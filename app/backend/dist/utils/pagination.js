"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
exports.paginate = paginate;
const constants_1 = require("../config/constants");
function parsePagination(query) {
    const page = Math.max(1, parseInt(query.page || '') || constants_1.PAGINATION_DEFAULT.page);
    const perPage = Math.min(constants_1.PAGINATION_DEFAULT.maxPerPage, Math.max(1, parseInt(query.perPage || '') || constants_1.PAGINATION_DEFAULT.perPage));
    return { page, perPage, skip: (page - 1) * perPage };
}
function paginate(data, total, params) {
    return {
        data,
        meta: {
            total,
            page: params.page,
            perPage: params.perPage,
            totalPages: Math.ceil(total / params.perPage),
        },
    };
}
//# sourceMappingURL=pagination.js.map