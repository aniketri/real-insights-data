'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { 
  Container,
  Button,
  LoadingSpinner,
  Avatar
} from '../../components/ui/design-system';
import { 
  HomeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
  BuildingOfficeIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CogIcon as CogIconSolid,
  UserIcon as UserIconSolid,
  SparklesIcon as SparklesIconSolid
} from '@heroicons/react/24/solid';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
  { name: 'Loans', href: '/loans', icon: DocumentTextIcon, iconSolid: DocumentTextIconSolid },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon, iconSolid: ChartBarIconSolid },
  { name: 'AI Query', href: '/ai-query', icon: SparklesIcon, iconSolid: SparklesIconSolid },
  { name: 'Profile', href: '/profile', icon: UserIcon, iconSolid: UserIconSolid },
  { name: 'Settings', href: '/settings', icon: CogIcon, iconSolid: CogIconSolid },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notification count

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.div
          initial={{ x: -280 }}
          animate={{ x: sidebarOpen ? 0 : -280 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-y-0 left-0 z-50 w-70 bg-white shadow-lg lg:translate-x-0 lg:static lg:inset-0"
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BuildingOfficeIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Real Insights</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = isActive ? item.iconSolid : item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-2 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`
                      w-5 h-5 mr-3 transition-colors
                      ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                    `} />
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute right-0 w-1 h-8 bg-blue-600 rounded-l-full"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Profile */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar
                  src={session?.user?.image}
                  alt={session?.user?.name || 'User'}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main content */}
      <div className="lg:ml-70">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
              
              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <span>Real Insights</span>
                <span>/</span>
                <span className="text-gray-900 font-medium capitalize">
                  {pathname.split('/').pop() || 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 relative">
                  <BellIcon className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>
              </div>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <Avatar
                  src={session?.user?.image}
                  alt={session?.user?.name || 'User'}
                  size="sm"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {session?.user?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
} 