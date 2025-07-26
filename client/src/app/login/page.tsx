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
    <div
      style={{
        maxWidth: 400,
        margin: '80px auto',
        padding: 24,
        boxShadow: '0 2px 8px #f0f1f2',
        borderRadius: 8,
        background: '#fff',
      }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Đăng nhập</h2>
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
            style={{ height: 40 }}
          />
        </Form.Item>
        <Form.Item
          name='password'
          label='Mật khẩu'
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
          <Input.Password
            prefix={<LockOutlined />}
            placeholder='Mật khẩu'
            style={{ height: 40 }}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type='primary'
            htmlType='submit'
            block
            style={{ height: 40 }}
            loading={loginMutation.isPending}
            disabled={loginMutation.isPending}>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <span>Bạn chưa có tài khoản? </span>
        <Link href='/register' style={{ color: '#1677ff' }}>
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
