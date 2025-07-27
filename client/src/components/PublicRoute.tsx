'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '../constants';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.replace(ROUTES.HOME);
    } else {
      setShouldRender(true);
    }
  }, [router]);

  // Hiển thị loading khi đang kiểm tra
  if (shouldRender === null) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2'></div>
          <p className='text-gray-600'>Đang kiểm tra...</p>
        </div>
      </div>
    );
  }

  // Chỉ render children khi chưa authenticated
  return shouldRender ? <>{children}</> : null;
}
