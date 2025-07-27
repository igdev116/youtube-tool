'use client';
import React, { useEffect } from 'react';
import { useUserService } from '../hooks/useUserService';
import { useUserStore } from '../store/userStore';
import { LS_KEYS } from '~/constants';

export default function ProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { useQueryGetProfile } = useUserService();
  const [hasToken, setHasToken] = React.useState<boolean>(false);
  const setProfile = useUserStore((s: any) => s.setProfile);

  // Kiểm tra token trước khi gọi API
  React.useEffect(() => {
    const token = localStorage.getItem(LS_KEYS.ACCESS_TOKEN);
    setHasToken(!!token);
  }, []);

  // Luôn gọi hook nhưng disable query khi không có token
  const { data } = useQueryGetProfile(hasToken);

  useEffect(() => {
    if (hasToken && data?.result) {
      setProfile(data.result);
    }
  }, [data, setProfile, hasToken]);

  return <>{children}</>;
}
