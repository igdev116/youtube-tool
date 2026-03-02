"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramGroupModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const telegram_group_schema_1 = require("./telegram-group.schema");
const telegram_group_service_1 = require("./telegram-group.service");
const telegram_group_controller_1 = require("./telegram-group.controller");
const youtube_channel_schema_1 = require("../modules/youtube-channel/youtube-channel.schema");
let TelegramGroupModule = class TelegramGroupModule {
};
exports.TelegramGroupModule = TelegramGroupModule;
exports.TelegramGroupModule = TelegramGroupModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: telegram_group_schema_1.TelegramGroup.name, schema: telegram_group_schema_1.TelegramGroupSchema },
                { name: youtube_channel_schema_1.YoutubeChannel.name, schema: youtube_channel_schema_1.YoutubeChannelSchema },
            ]),
        ],
        controllers: [telegram_group_controller_1.TelegramGroupController],
        providers: [telegram_group_service_1.TelegramGroupService],
        exports: [telegram_group_service_1.TelegramGroupService],
    })
], TelegramGroupModule);
//# sourceMappingURL=telegram-group.module.js.map