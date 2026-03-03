import { AuthService } from './auth.service';
import { BaseResponse } from '../types/common.type';
import { LoginResponseDto } from './dto/login-response.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        username: string;
        password: string;
    }): Promise<BaseResponse<any>>;
    login(body: {
        username: string;
        password: string;
    }): Promise<BaseResponse<LoginResponseDto>>;
}
