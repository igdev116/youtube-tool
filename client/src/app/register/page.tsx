'use client';

import React from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthService } from '../../hooks/useAuthService';
import { toastSuccess, toastError } from '../../utils/toast';
import type { BaseResponse } from '../../types/common';
import Link from 'next/link';

const RegisterPage = () => {
  const { registerMutation } = useAuthService();

  const onFinish = (values: any) => {
    registerMutation.mutate(
      { username: values.username, password: values.password },
      {
        onSuccess: (res: BaseResponse<any>) => {
          if (res.success) {
            toastSuccess('Đăng ký thành công!');
          } else {
            toastError(res.message || 'Đăng ký thất bại!');
          }
        },
        onError: (err: any) => {
          toastError(err?.response?.data?.message || 'Đăng ký thất bại!');
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
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Đăng ký</h2>
      <Form
        name='register_form'
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
            loading={registerMutation.isPending}
            disabled={registerMutation.isPending}>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <span>Đã có tài khoản? </span>
        <Link href='/login' style={{ color: '#1677ff' }}>
          Đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
