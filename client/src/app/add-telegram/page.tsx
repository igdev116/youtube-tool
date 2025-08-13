'use client';

import React, { useState } from 'react';
import { Input, Button, Typography, Divider } from 'antd';
import { useTelegramService } from '../../hooks/useTelegramService';
import { toastSuccess, toastError } from '../../utils/toast';
import type { BaseResponse } from '../../types/common';
import { useUserStore } from '../../store/userStore';

const { Title } = Typography;

const AddTelegramPage = () => {
  const { updateGroupMutation, updateBotTokenMutation } = useTelegramService();
  const [telegramGroup, setTelegramGroup] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [isEditingToken, setIsEditingToken] = useState(false);
  const profile = useUserStore((s) => s.profile);

  React.useEffect(() => {
    if (profile?.telegramGroupId) {
      setTelegramGroup(profile.telegramGroupId);
      setIsEditing(false);
    }
    if (profile?.botToken) {
      setBotToken(profile.botToken);
      setIsEditingToken(false);
    }
  }, [profile?.telegramGroupId, profile?.botToken]);

  const handleUpdateGroup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

  const handleCancelGroup = () => {
    setIsEditing(false);
    setTelegramGroup(profile?.telegramGroupId || '');
  };

  const handleUpdateBotToken = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!botToken) {
      toastError('Vui lòng nhập Bot Token!');
      return;
    }
    updateBotTokenMutation.mutate(
      { botToken },
      {
        onSuccess: (res: BaseResponse<any>) => {
          if (res.success) {
            toastSuccess('Cập nhật Bot Token thành công!');
            setIsEditingToken(false);
          } else {
            toastError(res.message || 'Cập nhật Bot Token thất bại!');
          }
        },
        onError: (err: any) => {
          toastError(
            err?.response?.data?.message || 'Cập nhật Bot Token thất bại!'
          );
        },
      }
    );
  };

  const handleCancelBotToken = () => {
    setIsEditingToken(false);
    setBotToken(profile?.botToken || '');
  };

  return (
    <div className='max-w-2xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg'>
      <div className='mb-8'>
        <Title level={2} className='text-center mb-6'>
          Cập nhật group Telegram
        </Title>
        <form
          onSubmit={handleUpdateGroup}
          className='flex items-center gap-1.5 justify-center'>
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
            className='h-10 min-w-80'
            disabled={updateGroupMutation.isPending || !isEditing}
          />
          {!isEditing ? (
            <Button
              type='primary'
              className='h-10'
              onClick={() => setIsEditing(true)}
              disabled={updateGroupMutation.isPending}>
              {profile?.telegramGroupId ? 'Chỉnh sửa' : 'Cập nhật'}
            </Button>
          ) : (
            <>
              <Button
                type='primary'
                htmlType='submit'
                className='h-10'
                loading={updateGroupMutation.isPending}
                disabled={updateGroupMutation.isPending}>
                OK
              </Button>
              <Button
                className='h-10'
                onClick={handleCancelGroup}
                disabled={updateGroupMutation.isPending}>
                Hủy
              </Button>
            </>
          )}
        </form>
      </div>

      <Divider className='my-6' />

      <div>
        <Title level={2} className='text-center mb-6'>
          Cập nhật Bot Token
        </Title>
        <form
          onSubmit={handleUpdateBotToken}
          className='flex items-center gap-1.5 justify-center'>
          <Input.Password
            placeholder='Bot Token Telegram'
            value={botToken}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setBotToken(e.target.value)
            }
            className='h-10 min-w-80'
            visibilityToggle
            disabled={updateBotTokenMutation.isPending || !isEditingToken}
          />
          {!isEditingToken ? (
            <Button
              type='primary'
              className='h-10'
              onClick={() => setIsEditingToken(true)}
              disabled={updateBotTokenMutation.isPending}>
              {profile?.botToken ? 'Chỉnh sửa' : 'Cập nhật'}
            </Button>
          ) : (
            <>
              <Button
                type='primary'
                htmlType='submit'
                className='h-10'
                loading={updateBotTokenMutation.isPending}
                disabled={updateBotTokenMutation.isPending}>
                OK
              </Button>
              <Button
                className='h-10'
                onClick={handleCancelBotToken}
                disabled={updateBotTokenMutation.isPending}>
                Hủy
              </Button>
            </>
          )}
        </form>
        <p className='text-gray-500 text-center mt-3 text-sm'>
          Lưu ý: Bot Token dùng để gửi tin nhắn Telegram. Hãy bảo mật thông tin
          này.
        </p>
      </div>
    </div>
  );
};

export default AddTelegramPage;
