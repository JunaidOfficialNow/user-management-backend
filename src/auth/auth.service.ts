import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async signIn(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`No user found with this mail, ${email}`);
    }
    const result = await bcrypt.compare(pass, user.password);
    if (!result) {
      throw new UnauthorizedException('Passwords do not match');
    }
    const { password, ...userDetails } = user;

    const access_token = await this.jwtService.signAsync(userDetails);
    return access_token;
  }
}
