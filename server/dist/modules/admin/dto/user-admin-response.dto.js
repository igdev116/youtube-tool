"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserChannelResponseDto = exports.UserAdminResponseDto = void 0;
class UserAdminResponseDto {
    _id;
    username;
    password;
    channelCount;
    createdAt;
    updatedAt;
    telegramGroupId;
    botToken;
}
exports.UserAdminResponseDto = UserAdminResponseDto;
class UserChannelResponseDto {
    _id;
    channelId;
    xmlChannelId;
    lastVideoId;
    lastVideoAt;
    isActive;
    createdAt;
}
exports.UserChannelResponseDto = UserChannelResponseDto;
//# sourceMappingURL=user-admin-response.dto.js.map