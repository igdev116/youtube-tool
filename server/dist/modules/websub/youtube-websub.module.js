"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YoutubeWebsubModule = void 0;
const common_1 = require("@nestjs/common");
const youtube_websub_controller_1 = require("./youtube-websub.controller");
const youtube_websub_service_1 = require("./youtube-websub.service");
const mongoose_1 = require("@nestjs/mongoose");
const youtube_channel_schema_1 = require("../youtube-channel/youtube-channel.schema");
const telegram_module_1 = require("../../telegram/telegram.module");
let YoutubeWebsubModule = class YoutubeWebsubModule {
};
exports.YoutubeWebsubModule = YoutubeWebsubModule;
exports.YoutubeWebsubModule = YoutubeWebsubModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: youtube_channel_schema_1.YoutubeChannel.name, schema: youtube_channel_schema_1.YoutubeChannelSchema },
            ]),
            telegram_module_1.TelegramModule,
        ],
        controllers: [youtube_websub_controller_1.YoutubeWebsubController],
        providers: [youtube_websub_service_1.YoutubeWebsubService],
        exports: [youtube_websub_service_1.YoutubeWebsubService],
    })
], YoutubeWebsubModule);
//# sourceMappingURL=youtube-websub.module.js.map