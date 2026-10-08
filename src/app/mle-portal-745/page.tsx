'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SecretPortalPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070E18] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1677B8]" />
    </div>
  );
}
