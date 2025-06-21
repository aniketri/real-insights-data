import { Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.NEXTAUTH_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    OtpModule,
  ],
  providers: [JwtStrategy],
})
export class AuthModule {} 