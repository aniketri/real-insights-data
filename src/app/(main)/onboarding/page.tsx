'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChevronRightIcon, ChevronLeftIcon, CheckIcon, PlusIcon, BuildingOfficeIcon, CurrencyDollarIcon, UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

// Step definitions
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Real Insights',
    subtitle: 'Let\'s set up your debt portfolio management system',
    icon: UserGroupIcon
  },
  {
    id: 'organization',
    title: 'Organization Details',
    subtitle: 'Tell us about your company',
    icon: BuildingOfficeIcon
  },
  {
    id: 'portfolio',
    title: 'Create Your First Portfolio',
    subtitle: 'Set up your investment strategy',
    icon: CurrencyDollarIcon
  },
  {
    id: 'property',
    title: 'Add Your First Property',
    subtitle: 'Track your real estate assets',
    icon: BuildingOfficeIcon
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    subtitle: 'Welcome to professional debt management',
    icon: CheckIcon
  }
];

interface FormData {
  // Organization data
  organizationName: string;
  billingEmail: string;
  phone: string;
  address: string;
  website: string;
  
  // Portfolio data
  portfolioName: string;
  strategy: string;
  targetReturn: string;
  riskProfile: string;
  
  // Property data
  propertyName: string;
  propertyAddress: string;
  propertyType: string;
  purchasePrice: string;
  currentValue: string;
  yearBuilt: string;
  totalSqft: string;
}

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    billingEmail: '',
    phone: '',
    address: '',
    website: '',
    portfolioName: '',
    strategy: 'Core',
    targetReturn: '',
    riskProfile: 'Low',
    propertyName: '',
    propertyAddress: '',
    propertyType: 'OFFICE',
    purchasePrice: '',
    currentValue: '',
    yearBuilt: '',
    totalSqft: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    // Pre-fill organization name if available
    if (session.user?.email && !formData.organizationName) {
      const userEmail = session.user.email;
      setFormData(prev => ({
        ...prev,
        organizationName: `${session.user.name || userEmail.split('@')[0]}'s Organization`,
        billingEmail: userEmail
      }));
    }
  }, [session, status, router, formData.organizationName]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Submit all the data
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/dashboard?welcome=true');
      } else {
        console.error('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-sm z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Real Insights Setup</h1>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          
          {/* Step Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 transform transition-all duration-300 hover:scale-110">
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentStepData.title}</h2>
            <p className="text-gray-600 text-lg">{currentStepData.subtitle}</p>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
            {currentStep === 0 && <WelcomeStep />}
            {currentStep === 1 && <OrganizationStep formData={formData} onChange={handleInputChange} />}
            {currentStep === 2 && <PortfolioStep formData={formData} onChange={handleInputChange} />}
            {currentStep === 3 && <PropertyStep formData={formData} onChange={handleInputChange} />}
            {currentStep === 4 && <CompleteStep formData={formData} />}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5 mr-2" />
              Previous
            </button>

            {currentStep === ONBOARDING_STEPS.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : null}
                Get Started
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Next
                <ChevronRightIcon className="h-5 w-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual Step Components
function WelcomeStep() {
  return (
    <div className="text-center space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 border-2 border-blue-100 rounded-xl hover:border-blue-300 transition-all duration-200">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Portfolio Management</h3>
          <p className="text-gray-600 text-sm">Track loans, properties, and performance metrics</p>
        </div>
        
        <div className="p-6 border-2 border-purple-100 rounded-xl hover:border-purple-300 transition-all duration-200">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <DocumentTextIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Automated Reports</h3>
          <p className="text-gray-600 text-sm">Generate insights and compliance reports</p>
        </div>
      </div>
      
      <p className="text-gray-600 mt-6">
        This quick setup will get you started with your first portfolio, property, and loan tracking.
        You can always add more details later.
      </p>
    </div>
  );
}

function OrganizationStep({ formData, onChange }: { formData: FormData; onChange: (field: keyof FormData, value: string) => void }) {
  return (
    <div className="space-y-6 animate-slide-in-right">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
          <input
            type="text"
            value={formData.organizationName}
            onChange={(e) => onChange('organizationName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Your Company Name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Billing Email</label>
          <input
            type="email"
            value={formData.billingEmail}
            onChange={(e) => onChange('billingEmail', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="billing@company.com"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="+1 (555) 123-4567"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <textarea
          value={formData.address}
          onChange={(e) => onChange('address', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="123 Business Ave, Suite 100, City, State 12345"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => onChange('website', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="https://yourcompany.com"
        />
      </div>
    </div>
  );
}

function PortfolioStep({ formData, onChange }: { formData: FormData; onChange: (field: keyof FormData, value: string) => void }) {
  const strategies = ['Core', 'Core Plus', 'Value Add', 'Opportunistic', 'Bridge'];
  const riskProfiles = ['Low', 'Medium', 'High'];

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Name</label>
        <input
          type="text"
          value={formData.portfolioName}
          onChange={(e) => onChange('portfolioName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Core Real Estate Portfolio"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Investment Strategy</label>
          <select
            value={formData.strategy}
            onChange={(e) => onChange('strategy', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            {strategies.map(strategy => (
              <option key={strategy} value={strategy}>{strategy}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Risk Profile</label>
          <select
            value={formData.riskProfile}
            onChange={(e) => onChange('riskProfile', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            {riskProfiles.map(risk => (
              <option key={risk} value={risk}>{risk}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Target Return (%)</label>
        <input
          type="number"
          step="0.1"
          value={formData.targetReturn}
          onChange={(e) => onChange('targetReturn', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="8.5"
        />
      </div>
    </div>
  );
}

function PropertyStep({ formData, onChange }: { formData: FormData; onChange: (field: keyof FormData, value: string) => void }) {
  const propertyTypes = [
    'OFFICE', 'RETAIL', 'MULTIFAMILY', 'INDUSTRIAL', 
    'HOSPITALITY', 'MIXED_USE', 'MEDICAL', 'STORAGE', 'OTHER'
  ];

  return (
    <div className="space-y-6 animate-slide-in-right">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Property Name</label>
        <input
          type="text"
          value={formData.propertyName}
          onChange={(e) => onChange('propertyName', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Metropolitan Office Plaza"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Property Address</label>
        <textarea
          value={formData.propertyAddress}
          onChange={(e) => onChange('propertyAddress', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="456 Main Street, Downtown, City, State 12345"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
          <select
            value={formData.propertyType}
            onChange={(e) => onChange('propertyType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            {propertyTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase().replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Year Built</label>
          <input
            type="number"
            value={formData.yearBuilt}
            onChange={(e) => onChange('yearBuilt', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="2010"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price</label>
          <input
            type="number"
            value={formData.purchasePrice}
            onChange={(e) => onChange('purchasePrice', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="5000000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Value</label>
          <input
            type="number"
            value={formData.currentValue}
            onChange={(e) => onChange('currentValue', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="5500000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Sq Ft</label>
          <input
            type="number"
            value={formData.totalSqft}
            onChange={(e) => onChange('totalSqft', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="50000"
          />
        </div>
      </div>
    </div>
  );
}

function CompleteStep({ formData }: { formData: FormData }) {
  return (
    <div className="text-center space-y-6 animate-fade-in">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckIcon className="h-10 w-10 text-green-600" />
      </div>
      
      <h3 className="text-2xl font-semibold text-gray-900">Setup Complete!</h3>
      <p className="text-gray-600 text-lg">
        Your Real Insights platform is ready. Here's what we've set up for you:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900">Organization</h4>
          <p className="text-blue-700 text-sm">{formData.organizationName}</p>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-900">Portfolio</h4>
          <p className="text-purple-700 text-sm">{formData.portfolioName || 'Default Portfolio'}</p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900">Property</h4>
          <p className="text-green-700 text-sm">{formData.propertyName || 'Default Property'}</p>
        </div>
      </div>
      
      <p className="text-gray-500 mt-6">
        You can now add loans, track performance, and generate reports. Welcome to professional debt management!
      </p>
    </div>
  );
} 