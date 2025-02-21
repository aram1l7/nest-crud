import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseService } from './database/database.service';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [UsersModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
