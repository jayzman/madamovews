"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let MessagesService = class MessagesService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(createMessageDto) {
        return { message: 'Service temporarily disabled for maintenance' };
    }
    async findAll() {
        return [];
    }
    async findOne(id) {
        throw new common_1.NotFoundException(`Message with ID ${id} not found`);
    }
    async update(id, updateMessageDto) {
        throw new common_1.NotFoundException(`Message with ID ${id} not found`);
    }
    async remove(id) {
        throw new common_1.NotFoundException(`Message with ID ${id} not found`);
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], MessagesService);
//# sourceMappingURL=messages.service.new.js.map