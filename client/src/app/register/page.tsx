'use client';

import React from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthService } from '../../hooks/useAuthService';
import { toastSuccess, toastError } from '../../utils/toast';
import type { BaseResponse } from '../../types/common';
import Link from 'next/link';
import { ROUTES } from '../../constants';

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
    <div className='max-w-md mx-auto mt-20 p-6 shadow-lg rounded-lg bg-white'>
      <h2 className='text-center mb-6'>Đăng ký</h2>
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
            loading={registerMutation.isPending}
            disabled={registerMutation.isPending}>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
      <div className='text-center mt-4'>
        <span>Đã có tài khoản? </span>
        <Link href={ROUTES.LOGIN.INDEX} className='text-blue-500'>
          Đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
