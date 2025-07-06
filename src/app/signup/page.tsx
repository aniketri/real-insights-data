'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Input, Card, Alert, Container, Modal } from '../../components/ui/design-system';
import { 
  BuildingOfficeIcon, 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  BuildingOffice2Icon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import OtpInput from '../../components/otp-input';
import PasswordStrength from '../../components/password-strength';

// Helper function to add timeout to fetch requests
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw error;
  }
};

export default function SignupPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendMessage, setResendMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organizationName: '',
    password: ''
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isModalOpen && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isModalOpen, resendTimer]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsRegistering(true);
    
    try {
      const response = await fetchWithTimeout('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }, 30000);

      const data = await response.json();

      if (response.ok) {
        setEmailToVerify(formData.email);
        setIsModalOpen(true);
        setResendTimer(60);
        setMessage('Registration successful! Please check your email for verification code.');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please check your connection and try again.');
    } finally {
      setIsRegistering(false);
    }
  }

  const handleOtpVerification = async () => {
    setIsVerifying(true);
    setError('');
    
    try {
      const res = await fetchWithTimeout('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToVerify, otp }),
      }, 15000);

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        setMessage('Verification successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setError(error.message || 'Verification failed. Please check your connection and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setResendMessage('');
    setError('');
    
    try {
      const res = await fetchWithTimeout('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToVerify }),
      }, 15000);

      const data = await res.json();
      if (res.ok) {
        setResendMessage(data.message || 'OTP resent successfully!');
        setResendTimer(60);
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setError(error.message || 'Failed to resend OTP. Please check your connection and try again.');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Google signup error:', error);
    }
  };

  const handleMicrosoftSignup = async () => {
    try {
      await signIn('azure-ad', { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Microsoft signup error:', error);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <Container className="relative z-10">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/landing-page" className="inline-flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">Real Insights</span>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
              <p className="text-gray-600">Start managing your portfolio today</p>
            </motion.div>

            {/* Signup Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-8">
                {/* OAuth Buttons */}
                <div className="space-y-3 mb-6">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleGoogleSignup}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleMicrosoftSignup}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#f25022" d="M1 1h10v10H1z"/>
                      <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                      <path fill="#7fba00" d="M1 13h10v10H1z"/>
                      <path fill="#ffb900" d="M13 13h10v10H13z"/>
                    </svg>
                    Continue with Microsoft
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or create account with email</span>
                  </div>
                </div>

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Full Name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    icon={<UserIcon className="w-5 h-5" />}
                  />

                  <Input
                    label="Email address"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    icon={<EnvelopeIcon className="w-5 h-5" />}
                  />

                  <Input
                    label="Organization Name"
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                    placeholder="Enter your organization name"
                    icon={<BuildingOffice2Icon className="w-5 h-5" />}
                  />

                  <div className="relative">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Create a password"
                      icon={<LockClosedIcon className="w-5 h-5" />}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                    <PasswordStrength password={formData.password} />
                  </div>

                  <div className="text-sm text-gray-600">
                    By creating an account, you agree to our{' '}
                    <Link href="#" className="text-blue-600 hover:text-blue-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="#" className="text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    loading={isRegistering}
                  >
                    Create account
                  </Button>
                </form>

                {/* Messages */}
                {message && (
                  <motion.div 
                    className="mt-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Alert variant="success" icon={<CheckCircleIcon className="w-5 h-5" />}>
                      {message}
                    </Alert>
                  </motion.div>
                )}

                {error && (
                  <motion.div 
                    className="mt-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Alert variant="error">
                      {error}
                    </Alert>
                  </motion.div>
                )}

                {/* Login link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Footer */}
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-sm text-gray-500">
                Join 500+ real estate professionals
              </p>
            </motion.div>
          </div>
        </Container>
      </div>

      {/* OTP Verification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Verify your email"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EnvelopeIcon className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600 mb-6">
            We've sent a 6-digit verification code to{' '}
            <span className="font-medium text-gray-900">{emailToVerify}</span>
          </p>

          <div className="space-y-4">
            <OtpInput length={6} onChange={setOtp} />

            {error && (
              <Alert variant="error">
                {error}
              </Alert>
            )}

            {resendMessage && (
              <Alert variant="success">
                {resendMessage}
              </Alert>
            )}

            <Button
              onClick={handleOtpVerification}
              variant="gradient"
              size="lg"
              className="w-full"
              loading={isVerifying}
              disabled={otp.length !== 6}
            >
              Verify Email
            </Button>

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend code in {resendTimer}s
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Resend verification code
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
} 