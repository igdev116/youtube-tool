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
var CronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const youtube_channel_service_1 = require("../youtube-channel/youtube-channel.service");
let CronService = CronService_1 = class CronService {
    youtubeChannelService;
    logger = new common_1.Logger(CronService_1.name);
    constructor(youtubeChannelService) {
        this.youtubeChannelService = youtubeChannelService;
    }
    async handleYoutubeChannelCron() {
        await this.youtubeChannelService.notifyAllChannelsNewVideo();
    }
};
exports.CronService = CronService;
__decorate([
    (0, schedule_1.Cron)('*/50 * * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handleYoutubeChannelCron", null);
exports.CronService = CronService = CronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [youtube_channel_service_1.YoutubeChannelService])
], CronService);
//# sourceMappingURL=cron.service.js.map