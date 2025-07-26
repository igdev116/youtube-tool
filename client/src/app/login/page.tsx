'use client';

import React from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthService } from '../../hooks/useAuthService';
import { toastSuccess, toastError } from '../../utils/toast';
import type { BaseResponse } from '../../types/common';
import type { LoginResponse } from '../../types/auth';
import Link from 'next/link';

const LoginPage = () => {
  const { loginMutation } = useAuthService();

  const onFinish = (values: any) => {
    loginMutation.mutate(
      { username: values.username, password: values.password },
      {
        onSuccess: (res: BaseResponse<LoginResponse>) => {
          if (res.success) {
            toastSuccess('Đăng nhập thành công!');
            window.location.href = '/';
          } else {
            toastError(res.message || 'Đăng nhập thất bại!');
          }
        },
        onError: (err: any) => {
          toastError(err?.response?.data?.message || 'Đăng nhập thất bại!');
        },
      }
    );
  };

  return (
    <div className='max-w-md mx-auto mt-20 p-6 shadow-lg rounded-lg bg-white'>
      <h2 className='text-center mb-6'>Đăng nhập</h2>
      <Form
        name='login_form'
        initialValues={{ remember: true }}
        onFinish={onFinish}
        layout='vertical'>
        <Form.Item
          name='username'
          label='Tài khoản'
          rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}>
          <Input
            prefix={<UserOutlined />}
            placeholder='Tài khoản'
            className='h-10'
          />
        </Form.Item>
        <Form.Item
          name='password'
          label='Mật khẩu'
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
          <Input.Password
            prefix={<LockOutlined />}
            placeholder='Mật khẩu'
            className='h-10'
          />
        </Form.Item>
        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            block
            className='h-10'
            loading={loginMutation.isPending}
            disabled={loginMutation.isPending}>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
      <div className='text-center mt-4'>
        <span>Bạn chưa có tài khoản? </span>
        <Link href='/register' className='text-blue-500'>
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
