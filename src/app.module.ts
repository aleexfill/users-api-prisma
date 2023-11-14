import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [UserModule, PrismaModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
