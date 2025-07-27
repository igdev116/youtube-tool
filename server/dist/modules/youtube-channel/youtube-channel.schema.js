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
exports.YoutubeChannelSchema = exports.YoutubeChannel = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../user/user.schema");
let YoutubeChannel = class YoutubeChannel {
    channelId;
    lastVideoId;
    user;
    isActive;
};
exports.YoutubeChannel = YoutubeChannel;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], YoutubeChannel.prototype, "channelId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], YoutubeChannel.prototype, "lastVideoId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: user_schema_1.User.name, required: true }),
    __metadata("design:type", Object)
], YoutubeChannel.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], YoutubeChannel.prototype, "isActive", void 0);
exports.YoutubeChannel = YoutubeChannel = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], YoutubeChannel);
exports.YoutubeChannelSchema = mongoose_1.SchemaFactory.createForClass(YoutubeChannel);
//# sourceMappingURL=youtube-channel.schema.js.map