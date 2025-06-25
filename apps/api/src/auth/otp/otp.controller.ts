import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { OtpService } from './otp.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

// Basic DTOs for request validation
class GenerateOtpDto {
  email: string;
}

class VerifyOtpDto {
  email: string;
  token: string;
}

@Controller('auth/otp')
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateOtp(@Body() generateOtpDto: GenerateOtpDto): Promise<{ message: string }> {
    await this.otpService.generateAndSendOtp(generateOtpDto.email);
    return { message: 'OTP has been sent to your email.' };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<{ message: string; token: string }> {
    const isValid = await this.otpService.verifyOtp(verifyOtpDto.email, verifyOtpDto.token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP.');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: verifyOtpDto.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: verifyOtpDto.email,
          name: verifyOtpDto.email.split('@')[0], // A default name
          role: 'MEMBER', // Default role for new users
          permissions: ['READ_ALL'], // Basic permissions for new users
          organization: {
            create: {
              name: `${verifyOtpDto.email.split('@')[0]}'s Organization`,
            },
          },
        },
      });
    }

    const payload = { sub: user.id, email: user.email };
    const jwtToken = this.jwtService.sign(payload);

    return { message: 'OTP verified successfully.', token: jwtToken };
  }
}
