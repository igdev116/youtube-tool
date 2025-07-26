'use client';
import React, { useEffect } from 'react';
import { useUserService } from '../hooks/useUserService';
import { useUserStore } from '../store/userStore';

export default function ProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { useQueryGetProfile } = useUserService();
  const { data } = useQueryGetProfile();
  const setProfile = useUserStore((s: any) => s.setProfile);

  useEffect(() => {
    if (data?.result) {
      setProfile(data.result);
    }
  }, [data, setProfile]);

  return <>{children}</>;
}
