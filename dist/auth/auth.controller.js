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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const login_dto_1 = require("./dto/login.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const skip_auth_decorator_1 = require("./decorators/skip-auth.decorator");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    register(createUserDto) {
        return this.authService.register(createUserDto);
    }
    async login(loginDto, res) {
        const { token, user } = await this.authService.login(loginDto);
        return res.status(200).json({ message: "Connexion réussie", user, token });
    }
    async getProfile(req) {
        const user = req.user;
        if (!user) {
            throw new Error('Utilisateur non trouvé ou token invalide');
        }
        return user;
    }
    logout(res) {
        return res.status(200).send({ message: 'Déconnecté avec succès' });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer un nouvel utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Utilisateur créé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Un utilisateur avec cet email existe déjà' }),
    (0, swagger_1.ApiBody)({ type: create_user_dto_1.CreateUserDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, skip_auth_decorator_1.SkipAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Connecter un utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Connexion réussie' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Identifiants invalides' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiOperation)({ summary: 'Déconnexion' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Déconnecté avec succès' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)("auth"),
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map