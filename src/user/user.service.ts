import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user.dto';
import { Like, Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ access_token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (user) {
      throw new ConflictException('Email already in use');
    }
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create(createUserDto);
    await this.userRepository.save(newUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...details } = newUser;
    return { access_token: await this.jwtService.signAsync(details) };
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<string | User> {
    return (
      (await this.userRepository.findOne({ where: { id: id } })) ??
      'No user found'
    );
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async update(
    id: number,
    profileUrl: UpdateUserProfileDto,
  ): Promise<{ success: string | boolean }> {
    const result: UpdateResult = await this.userRepository.update(
      id,
      profileUrl,
    );
    if (result.affected === 0) {
      return { success: false };
    }
    return { success: profileUrl.photoUrl };
  }

  async changeActiveStatus(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const isActive = !user.isActive;
    await this.userRepository.update(id, { isActive });
    return { ...user, isActive };
  }

  async searchUserByName(searchQuery: string): Promise<User[]> {
    const users = await this.userRepository.find({
      select: ['name'],
      where: { name: Like(`${searchQuery}%`) },
    });
    return users;
  }

  async searchUserByEmail(searchQuery: string): Promise<User[]> {
    const users = await this.userRepository.find({
      select: ['email'],
      where: { email: Like(`${searchQuery}%`) },
    });
    return users;
  }
}
