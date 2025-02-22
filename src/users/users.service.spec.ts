import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { NotFoundException } from '@nestjs/common';

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

  it('should return error if creating a user without email or invalid email', async () => {
    userRepository.createUser = jest
      .fn()
      .mockRejectedValue(new Error('Invalid email'));

    await expect(
      service.createUser({ email: '', name: 'aram', password: 'Aram2003' }),
    ).rejects.toThrow('Invalid email');
  });

  it('should return error if trying to delete a user that does not exist', async () => {
    userRepository.deleteUser = jest
      .fn()
      .mockRejectedValue(new NotFoundException('User not found'));

    await expect(service.deleteUser(999)).rejects.toThrow(NotFoundException);
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
