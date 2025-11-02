"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseUtil = void 0;
const common_1 = require("@nestjs/common");
class ApiResponseUtil {
    static success(data, message = 'Success') {
        return {
            isSuccess: true,
            message,
            data,
            error: null,
        };
    }
    static error(message, code, details) {
        return {
            isSuccess: false,
            message,
            data: null,
            error: { code, details },
        };
    }
    static throwError(message, code = 'INTERNAL_ERROR', status = common_1.HttpStatus.INTERNAL_SERVER_ERROR, details) {
        throw new common_1.HttpException(ApiResponseUtil.error(message, code, details), status);
    }
}
exports.ApiResponseUtil = ApiResponseUtil;
//# sourceMappingURL=api-response.util.js.map