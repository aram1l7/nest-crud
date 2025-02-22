import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [UsersService, UsersRepository, PrismaService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
