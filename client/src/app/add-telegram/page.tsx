'use client';

import React, { useState } from 'react';
import { Input, Button, Typography, Divider, Form } from 'antd';
import { useTelegramService } from '../../hooks/useTelegramService';
import { toastSuccess, toastError } from '../../utils/toast';
import type { BaseResponse } from '../../types/common';
import { useUserStore } from '../../store/userStore';

const { Title } = Typography;

const AddTelegramPage = () => {
  const { updateGroupMutation, updateBotTokenMutation } = useTelegramService();
  // Create separate forms for Telegram Group and Bot Token
  const [telegramGroupForm] = Form.useForm();
  const [botTokenForm] = Form.useForm();
  const profile = useUserStore((s) => s.profile);

  // Mask the token for display
  const maskToken = React.useCallback((token?: string | null) => {
    if (!token) return '';
    if (token.length <= 3) return token;
    const last3 = token.slice(-3);
    const stars = '*'.repeat(token.length - 3);
    return `${stars}${last3}`;
  }, []);

  React.useEffect(() => {
    // Set Telegram Group form value
    if (profile?.telegramGroupId) {
      const fullLink = `https://web.telegram.org/k/#${profile.telegramGroupId}`;
      telegramGroupForm.setFieldsValue({
        telegramGroup: fullLink,
      });
    }

    // Set Bot Token form value
    if (profile?.botToken) {
      botTokenForm.setFieldsValue({
        botToken: profile.botToken,
      });
    }
  }, [profile, telegramGroupForm, botTokenForm]);

  const handleUpdateGroup = (values: { telegramGroup: string }) => {
    // Extract telegramGroupId from the full link
    const groupId = values.telegramGroup.replace(
      'https://web.telegram.org/k/#',
      ''
    );

    // Prepare full link to send to backend
    const fullLink = `https://web.telegram.org/k/#${groupId}`;

    updateGroupMutation.mutate(
      { link: fullLink },
      {
        onSuccess: (res: BaseResponse<any>) => {
          if (res.success) {
            toastSuccess('Cập nhật group Telegram thành công!');
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

  const handleUpdateBotToken = (values: { botToken: string }) => {
    updateBotTokenMutation.mutate(
      { botToken: values.botToken },
      {
        onSuccess: (res: BaseResponse<any>) => {
          if (res.success) {
            toastSuccess('Cập nhật Bot Token thành công!');
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

  return (
    <div className='max-w-2xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg'>
      <div className='mb-8'>
        <Title level={2} className='text-center mb-6'>
          Cập nhật group Telegram
        </Title>
        <Form
          form={telegramGroupForm}
          onFinish={handleUpdateGroup}
          className='flex items-start gap-2'>
          <Form.Item
            name='telegramGroup'
            initialValue={
              profile?.telegramGroupId
                ? `https://web.telegram.org/k/#${profile.telegramGroupId}`
                : ''
            }
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập link group Telegram!',
              },
              {
                validator: (_, value) => {
                  const telegramUrlRegex =
                    /^https:\/\/web\.telegram\.org\/k\/#-?\w+$/;

                  if (value && !telegramUrlRegex.test(value)) {
                    return Promise.reject(
                      new Error(
                        `Link group Telegram không đúng định dạng! \n (ví dụ: https://web.telegram.org/k/#-1001234567890)`
                      )
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            className='w-full mb-0'>
            <Input
              placeholder='https://web.telegram.org/k/#123'
              className='h-10 w-full'
              autoComplete='off'
              disabled={updateGroupMutation.isPending}
            />
          </Form.Item>

          <Button
            type='primary'
            htmlType='submit'
            className='h-10'
            loading={updateGroupMutation.isPending}>
            OK
          </Button>
        </Form>

        <Divider className='my-6' />

        <div>
          <Title level={2} className='text-center mb-6'>
            Cập nhật Bot Token
          </Title>
          <Form
            form={botTokenForm}
            onFinish={handleUpdateBotToken}
            className='flex items-start gap-2'>
            <Form.Item
              name='botToken'
              initialValue={profile?.botToken || ''}
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập Bot Token!',
                },
                {
                  validator: (_, value) => {
                    // Basic Bot Token validation
                    // Telegram Bot Token is typically a string of alphanumeric characters
                    const botTokenRegex = /^[0-9]{9,10}:[a-zA-Z0-9_-]{35}$/;

                    if (value && !botTokenRegex.test(value)) {
                      return Promise.reject(
                        new Error(
                          `Bot Token không đúng định dạng! \n (ví dụ: 123456789:ABCdefGHI-jklMNO_pqrSTUvwxYZ)`
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              className='w-full mb-0'>
              <Input
                placeholder='Nhập Bot Token Telegram'
                className='h-10 w-full'
                autoComplete='off'
              />
            </Form.Item>

            <Button
              type='primary'
              htmlType='submit'
              className='h-10'
              loading={updateBotTokenMutation.isPending}>
              OK
            </Button>
          </Form>
          <p className='text-gray-500 text-center mt-3 text-sm'>
            Lưu ý: Bot Token dùng để gửi tin nhắn Telegram. Hãy bảo mật thông
            tin này.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddTelegramPage;
