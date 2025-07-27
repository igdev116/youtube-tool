'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '../constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace(ROUTES.LOGIN.INDEX);
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Hiển thị loading hoặc null khi đang kiểm tra authentication
  if (isAuthenticated === null) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2'></div>
          <p className='text-gray-600'>Đang kiểm tra...</p>
        </div>
      </div>
    );
  }

  // Chỉ render children khi đã authenticated
  return isAuthenticated ? <>{children}</> : null;
}
