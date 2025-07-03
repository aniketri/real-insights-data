import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import prisma from '../../../../../packages/db';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const {
      organizationName,
      billingEmail,
      phone,
      address,
      website,
      portfolioName,
      strategy,
      targetReturn,
      riskProfile,
      propertyName,
      propertyAddress,
      propertyType,
      purchasePrice,
      currentValue,
      yearBuilt,
      totalSqft
    } = await req.json();

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    });

    if (!user?.organizationId) {
      return NextResponse.json({ message: 'User organization not found' }, { status: 404 });
    }

    // Update organization details
    const updatedOrganization = await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        name: organizationName || user.organization?.name,
        billingEmail: billingEmail || undefined,
        phone: phone || undefined,
        address: address || undefined,
        website: website || undefined,
      }
    });

    // Create portfolio if name is provided
    let portfolio = null;
    if (portfolioName) {
      portfolio = await prisma.portfolio.create({
        data: {
          name: portfolioName,
          strategy: strategy || 'Core',
          targetReturn: targetReturn ? parseFloat(targetReturn) / 100 : undefined, // Convert percentage to decimal
          riskProfile: riskProfile || 'Low',
          organizationId: user.organizationId,
        }
      });
    }

    // Create property if name is provided
    let property = null;
    if (propertyName) {
      property = await prisma.property.create({
        data: {
          name: propertyName,
          address: propertyAddress || '',
          propertyType: propertyType as any || 'OFFICE',
          yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
          totalSqft: totalSqft ? parseFloat(totalSqft) : undefined,
          purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
          currentValue: currentValue ? parseFloat(currentValue) : undefined,
          portfolioId: portfolio?.id,
          organizationId: user.organizationId,
        }
      });
    }

    // Update user to mark onboarding as complete (you can add an isOnboarded field to User model if needed)
    // For now, we'll consider any user with a named organization as onboarded

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      organization: updatedOrganization,
      portfolio,
      property,
    }, { status: 200 });

  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json({
      message: 'An error occurred during onboarding completion'
    }, { status: 500 });
  }
} 