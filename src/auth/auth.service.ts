import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async validateUser(payload: LoginDto) {
    const { email, password } = payload;
    const user = await this.usersService.getUserByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async login(email: string, password: string, request: Request) {
    const user = await this.validateUser({ email, password });
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);

    const previousToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (previousToken) {
      await this.redisService.setBlacklistToken(previousToken, 3600);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
      await this.redisService.isTokenBlacklisted(previousToken); // Here I force redis to update to store the token properly
    }

    return {
      access_token: accessToken,
    };
  }
}
