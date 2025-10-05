"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateIncidentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_incident_dto_1 = require("./create-incident.dto");
class UpdateIncidentDto extends (0, swagger_1.PartialType)(create_incident_dto_1.CreateIncidentDto) {
}
exports.UpdateIncidentDto = UpdateIncidentDto;
//# sourceMappingURL=update-incident.dto.js.map