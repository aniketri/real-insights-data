import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  async getDashboardData() {
    const user = this.request.user;
    if (!user || !user.organizationId) {
      // This should ideally not be hit if the guard is working correctly
      return { loans: [] };
    }

    // Temporarily simplified until Prisma types are updated
    const loans = await (this.prisma as any).loan.findMany({
      where: {
        organizationId: user.organizationId,
      },
      // TODO: Add includes back when Prisma client is properly generated
      // include: {
      //   property: true,
      //   lender: true,
      //   fund: true,
      // },
    });

    return { loans };
  }
}
