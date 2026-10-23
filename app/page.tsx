import { cookies } from 'next/headers';
import ClientHome from '@/components/ClientHome';

export const metadata = {
  title: 'iEmail — Bulk Email Dispatch from your Gmail',
  description: 'Personalize and safely send bulk emails directly through your verified Google account with zero data retention.',
};

export default async function Page() {
  const cookieStore = await cookies();
  const initialHasAuth = cookieStore.has('iEmail_auth');

  return <ClientHome initialHasAuth={initialHasAuth} />;
}
