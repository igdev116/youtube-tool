"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeChannelModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const youtube_channel_schema_1 = require("./youtube-channel.schema");
const youtube_channel_service_1 = require("./youtube-channel.service");
const youtube_channel_controller_1 = require("./youtube-channel.controller");
const user_module_1 = require("../../user/user.module");
const telegram_module_1 = require("../../telegram/telegram.module");
const queue_module_1 = require("../queue/queue.module");
let YoutubeChannelModule = class YoutubeChannelModule {
};
exports.YoutubeChannelModule = YoutubeChannelModule;
exports.YoutubeChannelModule = YoutubeChannelModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: youtube_channel_schema_1.YoutubeChannel.name, schema: youtube_channel_schema_1.YoutubeChannelSchema },
            ]),
            user_module_1.UserModule,
            telegram_module_1.TelegramModule,
            queue_module_1.QueueModule,
        ],
        providers: [youtube_channel_service_1.YoutubeChannelService],
        exports: [youtube_channel_service_1.YoutubeChannelService],
        controllers: [youtube_channel_controller_1.YoutubeChannelController],
    })
], YoutubeChannelModule);
//# sourceMappingURL=youtube-channel.module.js.map