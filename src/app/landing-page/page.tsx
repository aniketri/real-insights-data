'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Container, Section } from '../../components/ui/design-system';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  SparklesIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: ChartBarIcon,
    title: 'Portfolio Visualization',
    description: 'Gain a comprehensive view of your debt portfolio with interactive dashboards, key metrics, and performance analytics.',
  },
  {
    icon: DocumentTextIcon,
    title: 'Comprehensive Loan Database',
    description: 'Track every detail of your loans with advanced search, filtering, and document management capabilities.',
  },
  {
    icon: SparklesIcon,
    title: 'AI-Powered Insights',
    description: 'Leverage artificial intelligence to extract insights, generate reports, and make data-driven decisions.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise Security',
    description: 'Bank-grade security with role-based access controls and comprehensive audit trails.',
  },
];

const stats = [
  { value: '$2.5B+', label: 'Assets Under Management' },
  { value: '500+', label: 'Properties Tracked' },
  { value: '50+', label: 'Enterprise Clients' },
  { value: '99.9%', label: 'Uptime Guarantee' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <Container>
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Real Insights</span>
            </motion.div>

            <motion.nav 
              className="hidden md:flex items-center space-x-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
            </motion.nav>

            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="gradient" size="sm">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </Container>
      </header>

      {/* Hero Section */}
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Clarity & Control in{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Real Estate Debt
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Transform your commercial real estate debt management with our comprehensive platform. 
              Track, analyze, and optimize your portfolio with enterprise-grade tools.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link href="/signup">
                <Button variant="gradient" size="lg" className="group">
                  Start Your Free Trial
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section id="features" className="bg-white">
        <Container>
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Everything You Need to Manage Your Portfolio
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Comprehensive tools designed for modern real estate professionals
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <motion.h2 
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Ready to Transform Your Portfolio Management?
            </motion.h2>
            <motion.p 
              className="text-xl text-blue-100 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Join thousands of real estate professionals who trust Real Insights to manage their portfolios.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Link href="/signup">
                <Button variant="default" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Start Free Trial
                </Button>
              </Link>
            </motion.div>
          </div>
        </Container>
      </Section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <Container>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Real Insights</span>
              </div>
              <p className="text-gray-400">
                Professional debt management for commercial real estate portfolios.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Real Insights. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
} 