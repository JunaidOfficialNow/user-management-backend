import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserProfileDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
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

  async update(id: number, updateUserProfileDto: UpdateUserProfileDto) {
    return '';
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
