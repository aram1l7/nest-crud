import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    try {
      const hashedPassword = await hash(password, 10);

      return await this.prisma.user.create({
        data: { name, email, password: hashedPassword },
      });
    } catch (error) {
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

  async updateUser(
    id: number,
    name?: string,
    password?: string,
  ): Promise<User> {
    try {
      const data: Partial<User> = {};

      if (name) data.name = name;
      if (password) data.password = password;

      if (Object.keys(data).length === 0) {
        throw new BadRequestException(
          'At least one field must be provided for update',
        );
      }

      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      console.error('Unexpected error in updateUser:', error);
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }

  async deleteUser(id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
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
