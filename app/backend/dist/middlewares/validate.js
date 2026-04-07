"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const ApiError_1 = require("../utils/ApiError");
function validate(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const message = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            throw ApiError_1.ApiError.badRequest(message);
        }
        req.body = result.data;
        next();
    };
}
//# sourceMappingURL=validate.js.map