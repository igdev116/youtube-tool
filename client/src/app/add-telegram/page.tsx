'use client';

import React, { useState } from 'react';
import { Input, Button, Typography } from 'antd';
import { useTelegramService } from '../../hooks/useTelegramService';
import { toastSuccess, toastError } from '../../utils/toast';
import type { BaseResponse } from '../../types/common';
import { useUserStore } from '../../store/userStore';

const { Title } = Typography;

const AddTelegramPage = () => {
  const { updateGroupMutation } = useTelegramService();
  const [telegramGroup, setTelegramGroup] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const profile = useUserStore((s) => s.profile);

  React.useEffect(() => {
    if (profile?.telegramGroupId) {
      setTelegramGroup(profile.telegramGroupId);
      setIsEditing(false);
    }
  }, [profile?.telegramGroupId]);

  const handleUpdateGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    if (!telegramGroup) {
      toastError('Vui lòng nhập ID group Telegram!');
      return;
    }
    // Luôn gửi link đầy đủ
    const groupId = telegramGroup.replace('https://web.telegram.org/k/#', '');
    const fullLink = `https://web.telegram.org/k/#${groupId}`;
    updateGroupMutation.mutate(
      { link: fullLink },
      {
        onSuccess: (res: BaseResponse<any>) => {
          if (res.success) {
            toastSuccess('Cập nhật group Telegram thành công!');
            setIsEditing(false);
          } else {
            toastError(res.message || 'Cập nhật group Telegram thất bại!');
          }
        },
        onError: (err: any) => {
          toastError(
            err?.response?.data?.message || 'Cập nhật group Telegram thất bại!'
          );
        },
      }
    );
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '40px auto',
        background: '#fff',
        padding: 32,
        borderRadius: 8,
        boxShadow: '0 2px 8px #f0f1f2',
      }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        Cập nhật group Telegram
      </Title>
      <form
        onSubmit={handleUpdateGroup}
        style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Input
          placeholder='ID group Telegram'
          value={
            telegramGroup
              ? `https://web.telegram.org/k/#${telegramGroup.replace('https://web.telegram.org/k/#', '')}`
              : ''
          }
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTelegramGroup(
              e.target.value.replace('https://web.telegram.org/k/#', '')
            )
          }
          style={{ height: 40, minWidth: 320 }}
          disabled={
            updateGroupMutation.isPending ||
            (!isEditing && !!profile?.telegramGroupId)
          }
        />
        <Button
          type='primary'
          htmlType='submit'
          style={{ height: 40 }}
          loading={updateGroupMutation.isPending}
          disabled={updateGroupMutation.isPending}>
          {profile?.telegramGroupId && !isEditing ? 'Chỉnh sửa' : 'Cập nhật'}
        </Button>
      </form>
    </div>
  );
};

export default AddTelegramPage;
