import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setBlacklistToken(token: string, ttl: number): Promise<void> {
    const data = await this.cacheManager.set(
      `blacklist:${token}`,
      true,
      ttl * 1000,
    );

    console.log(data, 'data');
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    console.log(
      await this.cacheManager.get(`blacklist:${token}`),
      'blacklistedtoken',
    );
    return (await this.cacheManager.get(`blacklist:${token}`)) === true;
  }
}
