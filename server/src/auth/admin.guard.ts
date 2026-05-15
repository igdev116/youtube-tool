import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { sub: string; username: string } | undefined;

    if (!user?.sub) {
      throw new ForbiddenException('Không có quyền truy cập');
    }

    const dbUser = await this.userService.findById(user.sub);
    if (!dbUser?.isAdmin) {
      throw new ForbiddenException('Chỉ admin mới có quyền thực hiện thao tác này');
    }

    return true;
  }
}
