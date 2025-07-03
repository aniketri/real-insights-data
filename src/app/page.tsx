import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();
  
  if (session?.user) {
    // Check if user needs to complete profile
    const needsProfileCompletion = !session.user.name || 
                                  session.user.name.includes('@') || 
                                  session.user.name.split(' ').length < 2;
    
    if (needsProfileCompletion) {
      redirect('/profile/complete');
    } else {
      redirect('/dashboard');
    }
  } else {
    redirect('/landing-page');
  }
} 