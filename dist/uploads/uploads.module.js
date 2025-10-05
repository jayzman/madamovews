"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs = require("fs");
const uploadsDir = (0, path_1.join)(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
let UploadsModule = class UploadsModule {
};
exports.UploadsModule = UploadsModule;
exports.UploadsModule = UploadsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: (req, file, cb) => {
                        cb(null, uploadsDir);
                    },
                    filename: (req, file, cb) => {
                        const randomName = Array(32)
                            .fill(null)
                            .map(() => Math.round(Math.random() * 16).toString(16))
                            .join("");
                        cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
                    },
                }),
                fileFilter: (req, file, cb) => {
                    if (file.mimetype.match(/\/(pdf|jpg|jpeg|png)$/)) {
                        cb(null, true);
                    }
                    else {
                        cb(new Error("Seuls les fichiers PDF, JPG, JPEG et PNG sont autorisés!"), false);
                    }
                },
            }),
        ],
        exports: [platform_express_1.MulterModule],
    })
], UploadsModule);
//# sourceMappingURL=uploads.module.js.map