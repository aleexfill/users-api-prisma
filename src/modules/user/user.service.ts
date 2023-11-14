import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly saltRounds: number;

  constructor(private readonly prisma: PrismaService) {
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(userData: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(
      userData.password,
      this.saltRounds,
    );
    return this.prisma.user.create({
      data: { ...userData, password: hashedPassword },
    });
  }

  async update(id: string, userData: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (userData.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: userData.email },
      });
      if (existingUser && existingUser.id !== user.id) {
        throw new ConflictException('Email is already in use by another user');
      }
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, this.saltRounds);
    }

    return this.prisma.user.update({ where: { id }, data: userData });
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.delete({ where: { id } });
  }
}
