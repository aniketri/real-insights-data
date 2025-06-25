import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

// Try importing from @repo/db first, fallback to direct PrismaClient import
let prismaClient: any;
try {
  const db = require('@repo/db');
  prismaClient = db.default || db;
} catch (error) {
  console.log('Failed to import from @repo/db, falling back to direct PrismaClient import');
  const { PrismaClient } = require('@prisma/client');
  prismaClient = new PrismaClient();
}

@Injectable()
export class PrismaService implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private readonly prisma = prismaClient;
  
  async onModuleInit() {
    try {
      this.logger.log('Initializing Prisma connection...');
      
      // Check if prisma client is properly loaded
      if (!this.prisma) {
        throw new Error('Prisma client is not initialized');
      }
      
      if (typeof this.prisma.$connect !== 'function') {
        throw new Error('Prisma $connect method is not available');
      }
      
      await this.prisma.$connect();
      this.logger.log('Prisma connection established successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Prisma:', error);
      throw error;
    }
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