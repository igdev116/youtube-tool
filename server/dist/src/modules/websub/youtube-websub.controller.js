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
var YoutubeWebsubController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeWebsubController = void 0;
const common_1 = require("@nestjs/common");
const youtube_websub_service_1 = require("./youtube-websub.service");
const constants_1 = require("../../constants");
let YoutubeWebsubController = YoutubeWebsubController_1 = class YoutubeWebsubController {
    service;
    logger = new common_1.Logger(YoutubeWebsubController_1.name);
    constructor(service) {
        this.service = service;
    }
    verify(challenge) {
        return challenge || '';
    }
    async notify(xml) {
        await this.service.handleNotification(xml);
        return 'ok';
    }
    async subscribe(body) {
        const topicUrl = `${constants_1.YT_FEED_BASE}?channel_id=${body.xmlChannelId}`;
        const callbackUrl = body.callbackUrl || `${process.env.API_URL}/websub/youtube/callback`;
        const status = await this.service.subscribeCallback(topicUrl, callbackUrl);
        return { success: status >= 200 && status < 300, status };
    }
    async unsubscribe(body) {
        const topicUrl = `${constants_1.YT_FEED_BASE}?channel_id=${body.xmlChannelId}`;
        const callbackUrl = body.callbackUrl || `${process.env.API_URL}/websub/youtube/callback`;
        const status = await this.service.unsubscribeCallback(topicUrl, callbackUrl);
        return { success: status >= 200 && status < 300, status };
    }
    async renew() {
        await this.service.renewExpiringSubscriptions();
        return { message: 'Renew process started' };
    }
};
exports.YoutubeWebsubController = YoutubeWebsubController;
__decorate([
    (0, common_1.Get)('callback'),
    __param(0, (0, common_1.Query)('hub.challenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], YoutubeWebsubController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)('callback'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], YoutubeWebsubController.prototype, "notify", null);
__decorate([
    (0, common_1.Post)('subscribe'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], YoutubeWebsubController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Post)('unsubscribe'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], YoutubeWebsubController.prototype, "unsubscribe", null);
__decorate([
    (0, common_1.Post)('renew'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], YoutubeWebsubController.prototype, "renew", null);
exports.YoutubeWebsubController = YoutubeWebsubController = YoutubeWebsubController_1 = __decorate([
    (0, common_1.Controller)('websub/youtube'),
    __metadata("design:paramtypes", [youtube_websub_service_1.YoutubeWebsubService])
], YoutubeWebsubController);
//# sourceMappingURL=youtube-websub.controller.js.map