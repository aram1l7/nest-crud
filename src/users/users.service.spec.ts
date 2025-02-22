/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            createUser: jest.fn(),
            deleteUser: jest.fn(),
            updateUser: jest.fn(),
            getUserById: jest.fn(),
            getUsers: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new user and return it', async () => {
    const createUserDto = {
      name: 'Aram',
      email: 'aram18m@gmail.com',
      password: 'Aram2003',
    } as CreateUserDto;

    const user = {
      name: 'Aram',
      id: Date.now(),
      password: 'Aram2003',
      email: 'aram18m@gmail.com',
    };

    jest.spyOn(userRepository, 'createUser').mockResolvedValue(user);

    const result = await service.createUser(createUserDto);

    expect(userRepository.createUser).toBeCalled();
    expect(userRepository.createUser).toBeCalledWith(createUserDto);

    expect(result).toEqual(user);
  });

  it('should return error if creating a user without email or invalid email', async () => {
    const invalidUser = {
      name: 'Aram',
      email: 'aram21',
      password: 'Aram2000',
    };

    jest
      .spyOn(userRepository, 'createUser')
      .mockRejectedValue(new Error('Invalid email'));

    await expect(service.createUser(invalidUser)).rejects.toThrow(
      'Invalid email',
    );
  });

  it('should get all users', async () => {
    const users = [
      {
        name: 'Aram',
        id: Date.now(),
        password: 'Aram2003',
        email: 'aram18m@gmail.com',
      },
    ];

    jest.spyOn(userRepository, 'getUsers').mockResolvedValue(users);

    const fetchedUsers = await service.getUsers();
    expect(fetchedUsers).toEqual(users);
  });

  it('should return error if trying to delete a user that does not exist', async () => {
    jest
      .spyOn(userRepository, 'deleteUser')
      .mockRejectedValue(new NotFoundException('User not found'));

    await expect(service.deleteUser(999)).rejects.toThrow(NotFoundException);
  });

  it('should delete a user when it exists', async () => {
    const existingUser = {
      id: 5,
      name: 'Aram',
      email: 'aram18m@gmail.com',
      password: 'Aram2003',
    };

    jest.spyOn(userRepository, 'deleteUser').mockResolvedValue(existingUser);

    await service.deleteUser(existingUser.id);

    expect(userRepository.deleteUser).toHaveBeenCalledWith(existingUser.id);
  });

  it('should update the user', async () => {
    const updatedUser = { id: 1, name: 'aram' };
    userRepository.updateUser = jest.fn().mockResolvedValue(updatedUser);

    const result = await service.updateUser(1, {
      name: 'aram2',
    });
    expect(result).toEqual(updatedUser);
  });
});
