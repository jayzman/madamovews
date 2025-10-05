"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePromoCodeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_promo_code_dto_1 = require("./create-promo-code.dto");
class UpdatePromoCodeDto extends (0, swagger_1.PartialType)(create_promo_code_dto_1.CreatePromoCodeDto) {
}
exports.UpdatePromoCodeDto = UpdatePromoCodeDto;
//# sourceMappingURL=update-promo-code.dto.js.map