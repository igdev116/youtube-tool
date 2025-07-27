import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { BaseResponse } from '../types/common.type';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    register(username: string, password: string): Promise<BaseResponse<any>>;
    login(username: string, password: string): Promise<BaseResponse<{
        accessToken: string;
    }>>;
}
