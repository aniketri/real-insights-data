import { auth } from '../../lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '../../components/Navbar';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Navbar session={session} />
        <main className="flex flex-1 justify-center py-5">
          {children}
        </main>
      </div>
    </div>
  );
} 