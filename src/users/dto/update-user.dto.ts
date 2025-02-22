import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(4, {
    message: 'Name cannot be empty and should be at least 4 characters long',
  })
  @Matches(/\S/, { message: 'Name cannot be only spaces' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;
}
