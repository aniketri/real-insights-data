import { Injectable, OnModuleInit } from '@nestjs/common';
import db from '@repo/db';

@Injectable()
export class PrismaService implements OnModuleInit {
  private readonly prisma = db;
  
  async onModuleInit() {
    await this.prisma.$connect();
  }
  
  get user() { return (this.prisma as any).user; }
  get organization() { return (this.prisma as any).organization; }
  get loan() { return (this.prisma as any).loan; }
  get property() { return (this.prisma as any).property; }
  get lender() { return (this.prisma as any).lender; }
  get fund() { return (this.prisma as any).fund; }
  get note() { return (this.prisma as any).note; }
  get oneTimePassword() { return (this.prisma as any).oneTimePassword; }
  get $connect() { return this.prisma.$connect.bind(this.prisma); }
  get $disconnect() { return this.prisma.$disconnect.bind(this.prisma); }
} 