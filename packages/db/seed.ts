import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  // Create sample organization
  const org = await prisma.organization.create({
    data: {
      name: 'Real Insights Demo Corp',
      subscriptionStatus: 'TRIAL',
      subscriptionTier: 'PROFESSIONAL',
      billingEmail: 'billing@realinsightsdemo.com',
      phone: '+1-555-0123',
      address: '456 Business Ave, Suite 100, New York, NY 10001',
      website: 'https://realinsightsdemo.com',
      taxId: '12-3456789',
    },
  });
  console.log('✅ Organization created:', org.name);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@realinsightsdemo.com',
      firstName: 'John',
      lastName: 'Admin',
      name: 'John Admin',
      role: 'ADMIN',
      jobTitle: 'Portfolio Manager',
      department: 'Investment Management',
      permissions: ['READ_ALL', 'WRITE_ALL', 'DELETE_ALL', 'ADMIN_PANEL'],
      organizationId: org.id,
    },
  });

  // Create manager user
  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@realinsightsdemo.com',
      firstName: 'Sarah',
      lastName: 'Manager',
      name: 'Sarah Manager',
      role: 'MANAGER',
      jobTitle: 'Asset Manager',
      department: 'Operations',
      permissions: ['READ_ALL', 'WRITE_LOANS', 'WRITE_PROPERTIES'],
      organizationId: org.id,
    },
  });

  // Create member user
  const memberUser = await prisma.user.create({
    data: {
      email: 'analyst@realinsightsdemo.com',
      firstName: 'Mike',
      lastName: 'Analyst',
      name: 'Mike Analyst',
      role: 'MEMBER',
      jobTitle: 'Financial Analyst',
      department: 'Finance',
      permissions: ['READ_ALL'],
      organizationId: org.id,
    },
  });
  console.log('✅ Users created: Admin, Manager, Member');

  // Create portfolios
  const corePortfolio = await prisma.portfolio.create({
    data: {
      name: 'Core Real Estate Portfolio',
      description: 'Stabilized income-producing properties',
      strategy: 'Core',
      targetReturn: 0.08,
      riskProfile: 'Low',
      managerId: adminUser.id,
      organizationId: org.id,
    },
  });

  const opportunityPortfolio = await prisma.portfolio.create({
    data: {
      name: 'Opportunity Fund I',
      description: 'Value-add and opportunistic investments',
      strategy: 'Opportunistic',
      targetReturn: 0.15,
      riskProfile: 'High',
      managerId: managerUser.id,
      organizationId: org.id,
    },
  });
  console.log('✅ Portfolios created: Core, Opportunity');

  // Create lenders
  const bankLender = await prisma.lender.create({
    data: {
      name: 'First National Bank',
      lenderType: 'BANK',
      contactName: 'Robert Smith',
      email: 'rsmith@firstnational.com',
      phone: '+1-555-0100',
      address: '100 Banking Plaza, New York, NY 10005',
      website: 'https://firstnational.com',
      minLoanSize: 1000000,
      maxLoanSize: 50000000,
      preferredLTV: 0.75,
      preferredDSCR: 1.25,
      organizationId: org.id,
    },
  });

  const lifeLender = await prisma.lender.create({
    data: {
      name: 'Metropolitan Life Insurance',
      lenderType: 'LIFE_INSURANCE',
      contactName: 'Jennifer Davis',
      email: 'jdavis@metlife.com',
      phone: '+1-555-0200',
      minLoanSize: 5000000,
      maxLoanSize: 100000000,
      preferredLTV: 0.70,
      preferredDSCR: 1.30,
      organizationId: org.id,
    },
  });

  const privateLender = await prisma.lender.create({
    data: {
      name: 'Capital Bridge Partners',
      lenderType: 'BRIDGE_LENDER',
      contactName: 'Michael Chen',
      email: 'mchen@capitalbridge.com',
      phone: '+1-555-0300',
      minLoanSize: 2000000,
      maxLoanSize: 25000000,
      preferredLTV: 0.80,
      preferredDSCR: 1.20,
      organizationId: org.id,
    },
  });
  console.log('✅ Lenders created: Bank, Life Insurance, Bridge');

  // Create funds
  const debtFund = await prisma.fund.create({
    data: {
      name: 'Real Estate Debt Fund I',
      fundType: 'DEBT_FUND',
      totalCommitment: 100000000,
      totalDeployed: 75000000,
      targetReturn: 0.12,
      managementFee: 0.015,
      performanceFee: 0.20,
      organizationId: org.id,
    },
  });

  const equityFund = await prisma.fund.create({
    data: {
      name: 'Opportunity Fund II',
      fundType: 'OPPORTUNITY_FUND',
      totalCommitment: 250000000,
      totalDeployed: 180000000,
      targetReturn: 0.18,
      managementFee: 0.02,
      performanceFee: 0.20,
      organizationId: org.id,
    },
  });
  console.log('✅ Funds created: Debt Fund, Opportunity Fund');

  // Create properties
  const officeProperty = await prisma.property.create({
    data: {
      name: 'Manhattan Office Tower',
      address: '123 Park Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10017',
      propertyType: 'OFFICE',
      subType: 'Class A Office',
      yearBuilt: 2015,
      totalSqft: 500000,
      leasableSqft: 450000,
      floors: 40,
      parkingSpaces: 200,
      purchasePrice: 250000000,
      currentValue: 275000000,
      appraisalDate: new Date('2024-01-15'),
      appraisalValue: 275000000,
      annualNOI: 18000000,
      occupancyRate: 0.92,
      walkScore: 95,
      transitScore: 88,
      portfolioId: corePortfolio.id,
      organizationId: org.id,
    },
  });

  const retailProperty = await prisma.property.create({
    data: {
      name: 'Westfield Shopping Center',
      address: '456 Commerce Drive',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      propertyType: 'RETAIL',
      subType: 'Regional Mall',
      yearBuilt: 2010,
      totalSqft: 800000,
      leasableSqft: 720000,
      floors: 3,
      parkingSpaces: 3000,
      purchasePrice: 120000000,
      currentValue: 135000000,
      appraisalDate: new Date('2024-02-01'),
      appraisalValue: 135000000,
      annualNOI: 9500000,
      occupancyRate: 0.88,
      walkScore: 65,
      portfolioId: opportunityPortfolio.id,
      organizationId: org.id,
    },
  });

  const multifamilyProperty = await prisma.property.create({
    data: {
      name: 'Riverside Apartments',
      address: '789 River Road',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      propertyType: 'MULTIFAMILY',
      subType: 'Garden Style',
      yearBuilt: 2018,
      totalSqft: 300000,
      leasableSqft: 280000,
      units: 250,
      floors: 4,
      parkingSpaces: 300,
      purchasePrice: 45000000,
      currentValue: 52000000,
      appraisalDate: new Date('2024-01-30'),
      appraisalValue: 52000000,
      annualNOI: 3800000,
      occupancyRate: 0.95,
      walkScore: 78,
      transitScore: 45,
      portfolioId: corePortfolio.id,
      organizationId: org.id,
    },
  });
  console.log('✅ Properties created: Office, Retail, Multifamily');

  // Create loans
  const officeLoan = await prisma.loan.create({
    data: {
      loanNumber: 'LON-2024-001',
      originalLoanBalance: 175000000,
      currentBalance: 165000000,
      originationDate: new Date('2022-03-15'),
      maturityDate: new Date('2027-03-15'),
      interestRate: 0.045,
      rateType: 'FIXED',
      amortizationType: 'INTEREST_ONLY',
      amortizationPeriod: 360,
      paymentFrequency: 'MONTHLY',
      ltv: 0.70,
      dscr: 1.35,
      debtYield: 0.065,
      isRecourse: false,
      isGuaranteed: true,
      guarantorInfo: 'Corporate guarantee by Real Insights Demo Corp',
      prepaymentPenalty: true,
      prepaymentTerms: 'Declining prepayment penalty: 3-2-1-0',
      loanStatus: 'CURRENT',
      riskRating: 'LOW',
      tags: ['Core', 'Office', 'NYC'],
      propertyId: officeProperty.id,
      lenderId: lifeLender.id,
      fundId: debtFund.id,
      portfolioId: corePortfolio.id,
      organizationId: org.id,
    },
  });

  const retailLoan = await prisma.loan.create({
    data: {
      loanNumber: 'LON-2024-002',
      originalLoanBalance: 85000000,
      currentBalance: 80000000,
      originationDate: new Date('2023-06-01'),
      maturityDate: new Date('2026-06-01'),
      interestRate: 0.055,
      rateType: 'FLOATING',
      indexType: 'SOFR',
      rateSpread: 0.025,
      rateFloor: 0.035,
      rateCap: 0.085,
      amortizationType: 'FULLY_AMORTIZING',
      amortizationPeriod: 300,
      paymentFrequency: 'MONTHLY',
      ltv: 0.75,
      dscr: 1.25,
      debtYield: 0.071,
      isRecourse: true,
      isGuaranteed: false,
      prepaymentPenalty: false,
      loanStatus: 'CURRENT',
      riskRating: 'MEDIUM',
      tags: ['Value-Add', 'Retail', 'LA'],
      propertyId: retailProperty.id,
      lenderId: privateLender.id,
      fundId: equityFund.id,
      portfolioId: opportunityPortfolio.id,
      organizationId: org.id,
    },
  });

  const multifamilyLoan = await prisma.loan.create({
    data: {
      loanNumber: 'LON-2024-003',
      originalLoanBalance: 32000000,
      currentBalance: 30500000,
      originationDate: new Date('2023-01-10'),
      maturityDate: new Date('2030-01-10'),
      interestRate: 0.042,
      rateType: 'FIXED',
      amortizationType: 'FULLY_AMORTIZING',
      amortizationPeriod: 360,
      paymentFrequency: 'MONTHLY',
      ltv: 0.71,
      dscr: 1.42,
      debtYield: 0.073,
      isRecourse: false,
      isGuaranteed: true,
      guarantorInfo: 'Limited guarantee for environmental and standard carve-outs',
      prepaymentPenalty: true,
      prepaymentTerms: 'Yield maintenance for first 3 years',
      loanStatus: 'CURRENT',
      riskRating: 'LOW',
      tags: ['Core', 'Multifamily', 'Austin'],
      propertyId: multifamilyProperty.id,
      lenderId: bankLender.id,
      portfolioId: corePortfolio.id,
      organizationId: org.id,
    },
  });
  console.log('✅ Loans created: Office, Retail, Multifamily');

  // Create covenants
  const dscrCovenant = await prisma.covenant.create({
    data: {
      name: 'Minimum DSCR',
      type: 'DSCR',
      description: 'Maintain minimum debt service coverage ratio',
      threshold: 1.25,
      operator: '>=',
      checkFrequency: 'Quarterly',
      isInCompliance: true,
      lastChecked: new Date(),
      nextCheckDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      loanId: officeLoan.id,
    },
  });

  const occupancyCovenant = await prisma.covenant.create({
    data: {
      name: 'Minimum Occupancy',
      type: 'OCCUPANCY',
      description: 'Maintain minimum occupancy rate',
      threshold: 0.85,
      operator: '>=',
      checkFrequency: 'Monthly',
      isInCompliance: true,
      lastChecked: new Date(),
      nextCheckDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      loanId: retailLoan.id,
    },
  });
  console.log('✅ Covenants created: DSCR, Occupancy');

  // Create notes
  const paymentNote = await prisma.note.create({
    data: {
      title: 'Payment Received',
      content: 'Monthly payment of $656,250 received on time. No issues.',
      noteType: 'PAYMENT',
      priority: 'NORMAL',
      tags: ['payment', 'on-time'],
      loanId: officeLoan.id,
      authorId: managerUser.id,
    },
  });

  const inspectionNote = await prisma.note.create({
    data: {
      title: 'Annual Property Inspection',
      content: 'Annual inspection completed. Property in excellent condition. Minor HVAC maintenance recommended for Q2.',
      noteType: 'INSPECTION',
      priority: 'NORMAL',
      tags: ['inspection', 'maintenance'],
      loanId: multifamilyLoan.id,
      authorId: memberUser.id,
    },
  });
  console.log('✅ Notes created: Payment, Inspection');

  // Create alerts
  const maturityAlert = await prisma.alert.create({
    data: {
      title: 'Loan Maturity Warning',
      message: 'Retail loan LON-2024-002 matures in 6 months. Begin refinancing discussions.',
      alertType: 'MATURITY_WARNING',
      priority: 'HIGH',
      triggerDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
      userId: adminUser.id,
      loanId: retailLoan.id,
      organizationId: org.id,
    },
  });

  const paymentAlert = await prisma.alert.create({
    data: {
      title: 'Payment Due Reminder',
      message: 'Monthly payment due for Manhattan Office Tower loan in 3 days.',
      alertType: 'PAYMENT_DUE',
      priority: 'NORMAL',
      triggerDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      userId: managerUser.id,
      loanId: officeLoan.id,
      organizationId: org.id,
    },
  });
  console.log('✅ Alerts created: Maturity Warning, Payment Due');

  // Create market data
  const sofrData = await prisma.marketData.create({
    data: {
      rateName: 'SOFR',
      rateType: 'OVERNIGHT',
      date: new Date(),
      rateValue: 0.0533,
      source: 'Federal Reserve',
      organizationId: org.id,
    },
  });

  const treasury10Y = await prisma.marketData.create({
    data: {
      rateName: '10Y Treasury',
      rateType: 'TREASURY_10Y',
      date: new Date(),
      rateValue: 0.0425,
      source: 'Treasury.gov',
      organizationId: org.id,
    },
  });
  console.log('✅ Market data created: SOFR, 10Y Treasury');

  // Create AI queries
  const aiQuery = await prisma.aIQuery.create({
    data: {
      query: 'What is the average DSCR across all loans in the core portfolio?',
      response: 'The average DSCR across all loans in the core portfolio is 1.39, which is above the typical minimum requirement of 1.25.',
      context: { portfolio: 'core', metric: 'dscr' },
      userId: memberUser.id,
      organizationId: org.id,
    },
  });
  console.log('✅ AI query created');

  // Create sample amortization schedule entries
  const currentDate = new Date();
  for (let i = 1; i <= 12; i++) {
    const paymentDate = new Date(currentDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);
    
    const beginningBalance = 30500000 - ((i - 1) * 15000); // Reducing balance
    const principalComponent = 15000;
    const interestComponent = beginningBalance * 0.042 / 12;
    const scheduledPayment = principalComponent + interestComponent;
    const endingBalance = beginningBalance - principalComponent;
    
    await prisma.amortizationSchedule.create({
      data: {
        paymentNumber: i,
        paymentDate,
        beginningBalance,
        scheduledPayment,
        principalComponent,
        interestComponent,
        endingBalance,
        cumulativePrincipal: principalComponent * i,
        cumulativeInterest: interestComponent * i,
        loanId: multifamilyLoan.id,
      },
    });
  }
  console.log('✅ Amortization schedule created (12 months)');

  // Create reports
  const portfolioReport = await prisma.report.create({
    data: {
      name: 'Monthly Portfolio Summary',
      reportType: 'PORTFOLIO_SUMMARY',
      parameters: { portfolioId: corePortfolio.id, period: 'monthly' },
      isScheduled: true,
      schedule: '0 9 1 * *', // First day of each month at 9 AM
      createdById: adminUser.id,
      organizationId: org.id,
    },
  });

  const maturityReport = await prisma.report.create({
    data: {
      name: 'Loan Maturity Schedule',
      reportType: 'MATURITY_SCHEDULE',
      parameters: { lookAhead: 24 }, // 24 months
      isScheduled: false,
      createdById: managerUser.id,
      organizationId: org.id,
    },
  });
  console.log('✅ Reports created: Portfolio Summary, Maturity Schedule');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Organization: ${org.name}`);
  console.log(`- Users: 3 (Admin, Manager, Member)`);
  console.log(`- Portfolios: 2 (Core, Opportunity)`);
  console.log(`- Properties: 3 (Office, Retail, Multifamily)`);
  console.log(`- Loans: 3 (Total: $275.5M)`);
  console.log(`- Lenders: 3 (Bank, Life Insurance, Bridge)`);
  console.log(`- Funds: 2 (Debt Fund, Opportunity Fund)`);
  console.log(`- Covenants: 2 (DSCR, Occupancy)`);
  console.log(`- Notes: 2 (Payment, Inspection)`);
  console.log(`- Alerts: 2 (Maturity, Payment Due)`);
  console.log(`- Market Data: 2 (SOFR, 10Y Treasury)`);
  console.log(`- Amortization Schedule: 12 entries`);
  console.log(`- Reports: 2 (Portfolio, Maturity)`);
  console.log(`- AI Queries: 1`);
  
  console.log('\n🔐 Login credentials:');
  console.log('Admin: admin@realinsightsdemo.com');
  console.log('Manager: manager@realinsightsdemo.com');
  console.log('Analyst: analyst@realinsightsdemo.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 