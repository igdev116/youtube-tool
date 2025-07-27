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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    userService;
    jwtService;
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async register(username, password) {
        const existing = await this.userService.findByUsername(username);
        if (existing) {
            return {
                success: false,
                statusCode: 400,
                message: 'Tên đăng nhập đã tồn tại',
                result: null,
            };
        }
        const user = await this.userService.createUser(username, password);
        return {
            success: true,
            statusCode: 201,
            message: 'Đăng ký thành công',
            result: { _id: String(user._id), username: user.username },
        };
    }
    async login(username, password) {
        const user = await this.userService.findByUsername(username);
        if (!user || user.password !== password) {
            return {
                success: false,
                statusCode: 400,
                message: 'Sai tên đăng nhập hoặc mật khẩu',
                result: null,
            };
        }
        const payload = { sub: String(user._id), username: user.username };
        const accessToken = this.jwtService.sign(payload);
        return {
            success: true,
            statusCode: 200,
            message: 'Đăng nhập thành công',
            result: { accessToken },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map