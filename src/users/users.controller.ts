import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user-dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createUser(@Body() body: CreateUserDto): Promise<User> {
    return this.usersService.createUser(body.name, body.email, body.password);
  }

  @Get()
  getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }

  @Get(':id')
  getUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.getUserById(Number(id));
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(Number(id), body.name, body.password);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string): Promise<User> {
    return this.usersService.deleteUser(Number(id));
  }
}
