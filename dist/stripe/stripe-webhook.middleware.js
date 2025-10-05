"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookMiddleware = void 0;
const common_1 = require("@nestjs/common");
const bodyParser = require("body-parser");
let StripeWebhookMiddleware = class StripeWebhookMiddleware {
    use(req, res, next) {
        if (req.originalUrl === '/locations/webhook' && req.method === 'POST') {
            bodyParser.raw({ type: 'application/json' })(req, res, next);
        }
        else {
            next();
        }
    }
};
exports.StripeWebhookMiddleware = StripeWebhookMiddleware;
exports.StripeWebhookMiddleware = StripeWebhookMiddleware = __decorate([
    (0, common_1.Injectable)()
], StripeWebhookMiddleware);
//# sourceMappingURL=stripe-webhook.middleware.js.map