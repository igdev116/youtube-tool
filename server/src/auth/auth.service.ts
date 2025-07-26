import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { BaseResponse } from '../types/common.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    username: string,
    password: string,
  ): Promise<BaseResponse<any>> {
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

  async login(
    username: string,
    password: string,
  ): Promise<BaseResponse<{ accessToken: string }>> {
    const user = await this.userService.findByUsername(username);
    if (!user || user.password !== password) {
      return {
        success: false,
        statusCode: 400,
        message: 'Sai tên đăng nhập hoặc mật khẩu',
        result: null,
      };
    }
    // Tạo accessToken
    const payload = { sub: String(user._id), username: user.username };
    const accessToken = this.jwtService.sign(payload);
    return {
      success: true,
      statusCode: 200,
      message: 'Đăng nhập thành công',
      result: { accessToken },
    };
  }
}
