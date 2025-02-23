import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { compare, hash } from 'bcrypt';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { email, password, name } = createUserDto;

      const hashedPassword = await hash(password, 10);
      return await this.prisma.user.create({
        data: { email, password: hashedPassword, name },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = error.meta?.target;

          throw new ConflictException(
            `User with this ${field as string} already exists`,
          );
        }
      }

      console.error('Unexpected error in createUser:', error);
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    const { name, password } = data;
    const existingUser = await this.prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      const updateData: Partial<User> = {};
      updateData.name = name;

      if (name && !password) {
        const isSameName = name.trim() === existingUser.name;
        if (isSameName) {
          throw new BadRequestException('No changes detected');
        }
      }
      if (password) {
        const isSamePassword = await compare(password, existingUser.password);
        if (isSamePassword) {
          throw new BadRequestException(
            'New password cannot be the same as the old password',
          );
        }
        updateData.password = await hash(password, 10);
      }

      return await this.prisma.user.update({ where: { id }, data: updateData });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const field = error.meta?.target;

        throw new ConflictException(
          `User with this ${field as string} already exists`,
        );
      }

      console.error('Unexpected error in updateUser:', error);
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }

  async deleteUser(id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      console.error('Unexpected error in deleteUser:', error);
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }
}
