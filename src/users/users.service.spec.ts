import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('UserService', () => {
  let service: UsersService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get(UsersService);
    prisma = module.get(PrismaService);
  });

  describe('getUserById', () => {
    it('should return user if it exists', async () => {
      const existingUser = {
        name: 'Existing User',
        id: 1,
        email: 'aram18m@gmail.com',
        password: 'Aram111',
      };

      prisma.user.findUnique.mockResolvedValue(existingUser);

      const result = await service.getUserById(existingUser.id);
      expect(result).toEqual(existingUser);
      expect(
        await prisma.user.findUnique({ where: { id: existingUser.id } }),
      ).toStrictEqual({
        name: 'Existing User',
        id: 1,
        email: 'aram18m@gmail.com',
        password: 'Aram111',
      });
    });

    it('should throw NotFoundException if user doesnt exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const allUsers = [
        {
          name: 'Existing User',
          id: 1,
          email: 'aram18m@gmail.com',
          password: 'Aram111',
        },
        {
          name: 'Existing User2',
          id: 2,
          email: 'aram19m@gmail.com',
          password: 'Aram111',
        },
      ];

      prisma.user.findMany.mockResolvedValue(allUsers);

      const result = await service.getUsers();
      expect(result).toEqual(allUsers);
    });

    it('should return empty array if there are no users', async () => {
      prisma.user.findMany.mockResolvedValue([]);

      const result = await service.getUsers();
      expect(result).toEqual([]);
    });

    it('should return error if creating user with email that already exists', async () => {
      const invalidUser = {
        name: 'New user',
        id: 1,
        email: 'aram18m@g',
        password: 'Aram111',
      };

      prisma.user.create.mockRejectedValue(
        new PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '4.0.0',
          meta: { target: ['email'] },
        }),
      );

      await expect(service.createUser(invalidUser)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createUser(invalidUser)).rejects.toMatchObject({
        response: {
          statusCode: 409,
          message: 'User with this email already exists',
        },
      });
    });
    it('should return error if creating a user without email or invalid email', async () => {
      const invalidUsers = [
        { name: 'John Doe', password: 'securePassword' },
        {
          name: 'Jane Doe',
          email: 'invalid-email',
          password: 'securePassword',
        },
      ];

      prisma.user.create.mockRejectedValue(
        new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: [{ email: ['Invalid email'] }],
        }),
      );

      for (const invalidUser of invalidUsers) {
        await expect(service.createUser(invalidUser as any)).rejects.toThrow(
          BadRequestException,
        );
        await expect(
          service.createUser(invalidUser as any),
        ).rejects.toMatchObject({
          response: {
            statusCode: 400,
            message: 'Validation failed',
            errors: [{ email: ['Invalid email'] }],
          },
        });
      }
    });

    it('should return error if trying to delete a user that does not exist', async () => {
      const nonExistentUserId = 84;

      const prismaError = new PrismaClientKnownRequestError(
        'Record to delete does not exist.',
        {
          code: 'P2025',
          clientVersion: '4.0.0',
        },
      );

      prisma.user.delete.mockRejectedValue(prismaError);

      await expect(service.deleteUser(nonExistentUserId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.deleteUser(nonExistentUserId)).rejects.toMatchObject(
        {
          response: {
            statusCode: 404,
            message: `User with ID ${nonExistentUserId} not found`,
          },
        },
      );
    });
  });
});
