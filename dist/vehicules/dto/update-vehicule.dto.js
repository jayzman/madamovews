"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVehiculeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_vehicule_dto_1 = require("./create-vehicule.dto");
class UpdateVehiculeDto extends (0, swagger_1.PartialType)(create_vehicule_dto_1.CreateVehiculeDto) {
}
exports.UpdateVehiculeDto = UpdateVehiculeDto;
//# sourceMappingURL=update-vehicule.dto.js.map