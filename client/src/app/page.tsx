'use client';

import React from 'react';
import { Table, Switch, Typography, Button } from 'antd';
import { useChannelService } from '../hooks/useChannelService';
import type { ChannelListItem } from '../types/channel';
import { DeleteOutlined } from '@ant-design/icons';
import { toastSuccess, toastError } from '../utils/toast';

const { Link } = Typography;

const HomePage = () => {
  const { useQueryGetListChannels, deleteChannelMutation } =
    useChannelService();
  const channelsQuery = useQueryGetListChannels({ limit: 20 });
  const data: ChannelListItem[] = channelsQuery.data?.result?.content || [];

  const handleDelete = (channelId: string) => {
    deleteChannelMutation.mutate(channelId, {
      onSuccess: (res) => {
        if (res.success) {
          toastSuccess('Xoá kênh thành công!');
        } else {
          toastError(res.message || 'Xoá kênh thất bại!');
        }
      },
      onError: (err: any) => {
        toastError(err?.response?.data?.message || 'Xoá kênh thất bại!');
      },
    });
  };

  const columns = [
    {
      title: 'Kênh Youtube',
      dataIndex: 'channelId',
      key: 'channelId',
      render: (channelId: string) => (
        <Link
          href={`https://www.youtube.com/${channelId}`}
          target='_blank'
          rel='noopener noreferrer'>
          {`https://www.youtube.com/${channelId}`}
        </Link>
      ),
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center' as const,
      render: (isActive: boolean) => <Switch checked={isActive} disabled />,
    },
    {
      title: '',
      key: 'action',
      align: 'center' as const,
      render: (_: any, record: ChannelListItem) => (
        <Button
          danger
          type='text'
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record._id)}
          loading={
            deleteChannelMutation.isPending &&
            deleteChannelMutation.variables === record._id
          }
        />
      ),
    },
  ];

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '40px auto',
        background: '#fff',
        padding: 32,
        borderRadius: 8,
        boxShadow: '0 2px 8px #f0f1f2',
      }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
        Danh sách kênh Youtube
      </h2>
      <Table
        columns={columns}
        dataSource={data.map((item) => ({ ...item, key: item.channelId }))}
        loading={channelsQuery.isLoading}
        pagination={false}
        bordered
      />
    </div>
  );
};

export default HomePage;
