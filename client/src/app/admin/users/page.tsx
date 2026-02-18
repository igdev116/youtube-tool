'use client';

import React from 'react';
import { Table, Typography, Input, Tag, Button, message, Modal } from 'antd';
import { useAdminService } from '../../../hooks/useAdminService';
import type { AdminUser } from '../../../types/admin';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import {
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import debounce from 'lodash/debounce';
import { toastSuccess, toastError } from '../../../utils/toast';
import { useRouter } from 'next/navigation';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const PasswordCell = ({ password }: { password: string }) => {
  const [visible, setVisible] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    message.success('Đã copy mật khẩu!');
  };

  return (
    <div className='flex items-center justify-between gap-2 min-w-[120px]'>
      <span
        className='font-mono text-sm tracking-tighter transition-all duration-300 cursor-pointer hover:text-primary'
        onClick={handleCopy}
        title='Click để copy'>
        {visible ? password : '••••••••'}
      </span>
      <Button
        type='text'
        size='small'
        className='text-gray-400 hover:text-primary p-0 h-6 w-6 flex items-center justify-center'
        icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        onClick={() => setVisible(!visible)}
      />
    </div>
  );
};

const AdminUsersPage = () => {
  const router = useRouter();
  const { useQueryGetUsers, deleteUserMutation } = useAdminService();

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [keyword, setKeyword] = React.useState('');

  const usersQuery = useQueryGetUsers({
    page: currentPage,
    limit: pageSize,
    keyword: keyword || undefined,
  });

  const data: AdminUser[] = usersQuery.data?.result?.content || [];
  const total = usersQuery.data?.result?.paging?.total || 0;

  // Debounce search
  const debounceSearch = React.useMemo(
    () =>
      debounce((val: string) => {
        setKeyword(val);
        setCurrentPage(1);
      }, 400),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debounceSearch(e.target.value);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`Đã copy ${label}!`);
  };

  const handleDelete = (userId: string, username: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa user',
      content: `Bạn có chắc chắn muốn xóa user "${username}" và tất cả channels liên quan?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        deleteUserMutation.mutate(userId, {
          onSuccess: () => {
            toastSuccess('Đã xóa user thành công!');
          },
          onError: () => {
            toastError('Có lỗi xảy ra khi xóa user!');
          },
        });
      },
    });
  };

  const handleViewChannels = (userId: string) => {
    router.push(`/admin/users/${userId}/channels`);
  };

  const truncateToken = (token?: string) => {
    if (!token) return 'Chưa có';
    if (token.length <= 10) return token;
    return `${token.slice(0, 4)}...${token.slice(-4)}`;
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (username: string) => (
        <span className='font-medium'>{username}</span>
      ),
    },
    {
      title: 'Password',
      dataIndex: 'password',
      key: 'password',
      width: 150,
      render: (password: string) => <PasswordCell password={password} />,
    },
    {
      title: 'Bot Token',
      dataIndex: 'botToken',
      key: 'botToken',
      width: 150,
      render: (botToken?: string) => {
        if (!botToken) {
          return <span className='text-gray-400'>Chưa có</span>;
        }
        return (
          <div className='flex items-center gap-2'>
            <span className='font-mono text-sm'>{truncateToken(botToken)}</span>
            <CopyOutlined
              className='cursor-pointer text-gray-400 hover:text-blue-500 transition'
              onClick={() => handleCopy(botToken, 'bot token')}
            />
          </div>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt: string) => {
        const dt = dayjs(createdAt);
        return (
          <div className='flex flex-col leading-tight'>
            <span>{dt.format('HH:mm DD/MM/YYYY')}</span>
            <span className='mt-1 text-xs text-gray-500'>({dt.fromNow()})</span>
          </div>
        );
      },
    },
    {
      title: 'Channels',
      dataIndex: 'channelCount',
      key: 'channelCount',
      align: 'center' as const,
      width: 180,
      render: (_: number, record: AdminUser) => (
        <div className='flex items-center justify-center gap-2'>
          <Tag
            color={record.channelCount > 0 ? 'blue' : 'default'}
            className='text-base px-3 py-1 m-0'>
            {record.channelCount} kênh
          </Tag>
          {record.channelCount > 0 && (
            <Button
              type='primary'
              size='small'
              icon={<EyeOutlined />}
              onClick={() => handleViewChannels(record._id)}>
              Xem
            </Button>
          )}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      align: 'center' as const,
      width: 80,
      render: (_: any, record: AdminUser) => (
        <Button
          danger
          type='text'
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record._id, record.username)}
          loading={
            deleteUserMutation.isPending &&
            deleteUserMutation.variables === record._id
          }
        />
      ),
    },
  ];

  const pagination = {
    current: currentPage,
    pageSize: pageSize,
    total: total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} của ${total} người dùng`,
    onChange: (page: number, size: number) => {
      setCurrentPage(page);
      setPageSize(size);
    },
  };

  return (
    <div className='max-w-6xl mx-auto mt-10 bg-white px-6 pt-4 rounded-lg shadow-lg'>
      <div className='flex flex-col gap-4 mb-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-center mb-0 text-2xl font-bold'>
            Quản lý người dùng{' '}
            <span className='text-primary'>({total} người dùng)</span>
          </h2>
        </div>
        <div>
          <Input.Search
            placeholder='Tìm kiếm theo username...'
            allowClear
            value={search}
            onChange={handleSearchChange}
            className='max-w-md'
          />
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data.map((item) => ({ ...item, key: item._id }))}
        loading={usersQuery.isLoading}
        pagination={pagination}
        bordered
        rowKey='_id'
        scroll={{ y: 'calc(100vh - 320px)' }}
      />
    </div>
  );
};

export default AdminUsersPage;
