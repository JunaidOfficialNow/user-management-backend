import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdminAuthGuard, AuthGuard } from 'src/auth/auth.guard';

interface userRequest extends Request {
  user: User;
}

@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ access_token: string }> {
    return await this.userService.create(createUserDto);
  }
  @UseGuards(AuthGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin')
  async findAdminAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('current')
  async fineCurrentUser(@Req() req: userRequest): Promise<User | string> {
    return await this.userService.findOne(req.user.id);
  }

  @UseGuards(AdminAuthGuard)
  @Get('search')
  async searchUsers(@Query('q') searchQuery: string): Promise<object> {
    const names = await this.userService.searchUserByName(searchQuery);
    const emails = await this.userService.searchUserByEmail(searchQuery);
    const results = {
      names: names.map((name) => name.name),
      emails: emails.map((email) => email.email),
    };
    return results;
  }
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User | string> {
    return await this.userService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Post('profile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './profiles',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          const extension = extname(file.originalname);
          cb(null, `${randomName}${extension}`);
        },
      }),
    }),
  )
  async updatePhoto(
    @Req() req: userRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ success: string | boolean }> {
    return await this.userService.update(req.user.id, {
      photoUrl: file.filename,
    });
  }
  @UseGuards(AdminAuthGuard)
  @Patch('active/:id/admin')
  async toggleActiveStatus(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User> {
    return await this.userService.changeActiveStatus(id);
  }
}
