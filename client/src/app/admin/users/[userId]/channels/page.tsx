'use client';

import React from 'react';
import {
  Table,
  Switch,
  Typography,
  Button,
  Input,
  Tag,
  Spin,
  message,
  Popconfirm,
} from 'antd';
import type { AdminUserChannel } from '../../../../../types/admin';
import {
  ArrowLeftOutlined,
  CopyOutlined,
  LinkOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useRouter, useParams } from 'next/navigation';
import { useAdminService } from '../../../../../hooks/useAdminService';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Link } = Typography;

const UserChannelsPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;

  const {
    useQueryGetUserChannels,
    useQueryGetUser,
    deleteUserChannelMutation,
  } = useAdminService();

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [keyword, setKeyword] = React.useState('');

  // Fetch user info
  const userQuery = useQueryGetUser(userId, !!userId);
  const user = userQuery.data?.result;

  // Fetch channels (Server-side pagination)
  const channelsQuery = useQueryGetUserChannels(
    userId,
    {
      page: currentPage,
      limit: pageSize,
      keyword: keyword || undefined,
    },
    !!userId,
  );

  const channels: AdminUserChannel[] =
    channelsQuery.data?.result?.content || [];
  const total = channelsQuery.data?.result?.paging?.total || 0;

  // Debounce search
  const debounceSearch = React.useMemo(
    () =>
      debounce((val: string) => {
        setKeyword(val);
        setCurrentPage(1); // Reset to first page on search
      }, 400),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debounceSearch(e.target.value);
  };

  const handleDeleteChannel = (channelId: string) => {
    deleteUserChannelMutation.mutate(
      { userId, channelId },
      {
        onSuccess: () => {
          message.success('Đã xóa kênh thành công');
        },
        onError: (error: any) => {
          message.error(error?.response?.data?.message || 'Lỗi khi xóa kênh');
        },
      },
    );
  };

  const columns = [
    {
      title: 'Kênh Youtube',
      dataIndex: 'channelId',
      key: 'channelId',
      width: 250,
      render: (channelId: string) => {
        const link = `https://www.youtube.com/${channelId}`;

        return (
          <div className='flex items-center gap-2'>
            <Link href={link} target='_blank' rel='noopener noreferrer'>
              {link}
            </Link>
            <CopyOutlined
              className='cursor-pointer text-gray-400 hover:text-blue-500 transition'
              onClick={() => {
                navigator.clipboard.writeText(link);
                message.success('Đã copy link!');
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'Video mới nhất',
      dataIndex: 'lastVideoId',
      key: 'lastVideoId',
      width: 180,
      render: (lastVideoId: string) => {
        if (!lastVideoId) {
          return <Tag color='warning'>Chưa cập nhật</Tag>;
        }
        const videoLink = `https://www.youtube.com/watch?v=${lastVideoId}`;
        return (
          <Button
            type='link'
            size='small'
            className='h-auto flex items-center gap-1'
            onClick={() => window.open(videoLink, '_blank')}>
            <LinkOutlined />
            Xem ngay
          </Button>
        );
      },
    },
    {
      title: 'Ngày đăng cuối',
      dataIndex: 'lastVideoAt',
      key: 'lastVideoAt',
      width: 180,
      render: (lastVideoAt: string) => {
        if (!lastVideoAt) {
          return <Tag color='warning'>Chưa cập nhật</Tag>;
        }
        const dt = dayjs(lastVideoAt);
        return (
          <div className='flex flex-col leading-tight'>
            <span>{dt.format('HH:mm DD/MM/YYYY')}</span>
            <span className='mt-1 text-xs text-gray-500'>({dt.fromNow()})</span>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center' as const,
      width: 120,
      render: (isActive: boolean) => (
        <Switch checked={isActive} disabled={true} />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: AdminUserChannel) => (
        <Popconfirm
          title='Bạn có chắc chắn muốn xóa kênh này không?'
          onConfirm={() => handleDeleteChannel(record._id)}
          okText='Có'
          cancelText='Không'
          okButtonProps={{ danger: true }}>
          <Button
            danger
            type='text'
            icon={<DeleteOutlined />}
            loading={
              deleteUserChannelMutation.isPending &&
              deleteUserChannelMutation.variables?.channelId === record._id
            }
          />
        </Popconfirm>
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
      `${range[0]}-${range[1]} của ${total} kênh`,
    onChange: (page: number, size: number) => {
      setCurrentPage(page);
      setPageSize(size);
    },
  };

  if (userQuery.isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto mt-10 bg-white px-6 pt-4 rounded-lg shadow-lg'>
      <div className='mb-6'>
        <Button
          type='text'
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/admin/users')}
          className='mb-4'>
          Quay lại
        </Button>

        <div className='flex justify-between items-center'>
          <h2 className='mb-0 text-2xl font-bold'>
            Danh sách kênh của{' '}
            <span className='text-primary'>
              {user?.username} ({total} kênh)
            </span>
          </h2>
        </div>
      </div>

      <div className='mb-4'>
        <Input.Search
          placeholder='Tìm kiếm kênh Youtube...'
          allowClear
          value={search}
          onChange={handleSearchChange}
          className='max-w-md'
        />
      </div>

      <Table
        columns={columns}
        dataSource={channels}
        loading={channelsQuery.isLoading}
        pagination={pagination}
        rowKey='_id'
        bordered
        scroll={{ y: 'calc(100vh - 380px)' }}
        locale={{
          emptyText: keyword ? 'Không tìm thấy kênh nào' : 'Chưa có kênh nào',
        }}
      />
    </div>
  );
};

export default UserChannelsPage;
