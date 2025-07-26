'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { PropsWithChildren, useRef } from 'react';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: PropsWithChildren) {
  const queryClientRef = useRef<QueryClient>();
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
      <Toaster position='top-center' />
    </QueryClientProvider>
  );
}
