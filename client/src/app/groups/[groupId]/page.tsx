'use client';

import React from 'react';
import {
  Table,
  Switch,
  Typography,
  Button,
  message,
  Tag,
  Tooltip,
  Popconfirm,
  Empty,
  Select,
  Modal,
  Spin,
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  LinkOutlined,
  ArrowLeftOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import { useGroupService } from '../../../hooks/useGroupService';
import { useChannelService } from '../../../hooks/useChannelService';
import type { ChannelListItem } from '../../../types/channel';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Link } = Typography;

// Add Channel Modal
const AddChannelModal = ({
  open,
  loading,
  existingIds,
  allChannels,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  loading: boolean;
  existingIds: string[];
  allChannels: ChannelListItem[];
  onCancel: () => void;
  onConfirm: (channelDbIds: string[]) => void;
}) => {
  const [selected, setSelected] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (open) setSelected([]);
  }, [open]);

  const available = allChannels.filter((ch) => !existingIds.includes(ch._id));

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title='Thêm kênh vào Group'
      onOk={() => onConfirm(selected)}
      okText='Thêm'
      cancelText='Huỷ'
      confirmLoading={loading}
      okButtonProps={{ disabled: selected.length === 0 }}
      destroyOnHidden>
      <div className='mt-3'>
        <Select
          mode='multiple'
          className='w-full'
          placeholder='Chọn kênh để thêm...'
          value={selected}
          onChange={setSelected}
          showSearch
          size='large'
          filterOption={(input, opt) =>
            (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={available.map((ch) => ({
            value: ch._id,
            label: ch.channelId,
          }))}
          notFoundContent={
            available.length === 0
              ? 'Tất cả kênh đã trong group này'
              : 'Không tìm thấy'
          }
        />
      </div>
    </Modal>
  );
};

// ============= Group Detail Page =============
const GroupDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const groupId = params.groupId as string;

  const { useQueryGetGroupById, useQueryGetGroupChannels } = useGroupService();
  const {
    useQueryGetListChannels,
    addGroupToChannelMutation,
    removeGroupFromChannelMutation,
    toggleChannelMutation,
    invalidateChannels,
  } = useChannelService();

  const groupQuery = useQueryGetGroupById(groupId);
  const group = groupQuery.data?.result;

  const groupChannelsQuery = useQueryGetGroupChannels(groupId);
  const groupChannels: ChannelListItem[] =
    groupChannelsQuery.data?.result || [];

  // All user channels for add modal
  const allChannelsQuery = useQueryGetListChannels({ page: 1, limit: 500 });
  const allChannels: ChannelListItem[] =
    allChannelsQuery.data?.result?.content || [];

  const [addModal, setAddModal] = React.useState(false);

  const handleAddChannels = (channelDbIds: string[]) => {
    const promises = channelDbIds.map((dbId) =>
      addGroupToChannelMutation.mutateAsync({ channelDbId: dbId, groupId }),
    );
    Promise.all(promises)
      .then(() => {
        message.success(`Đã thêm ${channelDbIds.length} kênh vào group!`);
        setAddModal(false);
      })
      .catch(() => message.error('Thêm kênh thất bại!'));
  };

  const handleRemoveChannel = (channelDbId: string) => {
    removeGroupFromChannelMutation.mutate(
      { channelDbId, groupId },
      {
        onSuccess: () => message.success('Đã xóa kênh khỏi group!'),
        onError: () => message.error('Xóa kênh thất bại!'),
      },
    );
  };

  const handleToggleChannel = (channelId: string) => {
    toggleChannelMutation.mutate(channelId, {
      onSuccess: (res) => {
        if (res.success) {
          invalidateChannels();
        } else {
          message.error(res.message || 'Cập nhật trạng thái kênh thất bại!');
        }
      },
      onError: (err: any) => {
        message.error(
          err?.response?.data?.message || 'Cập nhật trạng thái kênh thất bại!',
        );
      },
    });
  };

  const columns: ColumnsType<ChannelListItem> = [
    {
      title: 'Kênh YouTube',
      dataIndex: 'channelId',
      key: 'channelId',
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
      width: 150,
      render: (lastVideoId: string) => {
        if (!lastVideoId) {
          return (
            <Tooltip
              title='Vui lòng thêm Bot vào Telegram Group để tự động cập nhật video mới!'
              placement='top'
              mouseEnterDelay={0}
              mouseLeaveDelay={0}>
              <Tag color='warning'>Chưa cập nhật</Tag>
            </Tooltip>
          );
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
      width: 170,
      render: (lastVideoAt: string) => {
        if (!lastVideoAt) {
          return (
            <Tooltip
              title='Vui lòng thêm Bot vào Telegram Group để tự động cập nhật video mới!'
              placement='top'
              mouseEnterDelay={0}
              mouseLeaveDelay={0}>
              <Tag color='warning'>Chưa cập nhật</Tag>
            </Tooltip>
          );
        }

        const dt = dayjs(lastVideoAt);
        return (
          <div className='flex flex-col leading-tight'>
            <span>{dt.format('HH:mm DD/MM/YY')}</span>
            <span className='mt-1 text-xs text-gray-500'>({dt.fromNow()})</span>
          </div>
        );
      },
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center' as const,
      width: 100,
      render: (isActive: boolean, record: ChannelListItem) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleChannel(record._id)}
          loading={
            toggleChannelMutation.isPending &&
            toggleChannelMutation.variables === record._id
          }
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record: ChannelListItem) => (
        <Popconfirm
          title='Xóa kênh này khỏi group?'
          onConfirm={() => handleRemoveChannel(record._id)}
          okText='Xóa'
          cancelText='Huỷ'
          okButtonProps={{ danger: true }}>
          <Tooltip title='Xóa khỏi group'>
            <Button type='text' size='small' danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  if (groupQuery.isLoading) {
    return (
      <div className='flex justify-center items-center min-h-64'>
        <Spin size='large' />
      </div>
    );
  }

  if (!group) {
    return (
      <div className='p-6'>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/groups')}
          className='mb-4'>
          Quay lại
        </Button>
        <Empty description='Group không tồn tại' />
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto mt-10 mb-10 bg-white px-6 py-4 rounded-lg shadow-lg'>
      {/* Back + Header */}
      <div className='flex items-center gap-3 mb-6'>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/groups')}
          size='middle'
          className='flex items-center justify-center'
        />
        <h2 className='text-2xl font-bold mb-0'>
          {group.name}{' '}
          <span className='text-primary'>({groupChannels.length} kênh)</span>
        </h2>
      </div>

      {/* Group Info */}
      <div className='bg-gray-50 border border-gray-200 rounded-lg p-3 mb-5 text-sm flex flex-wrap gap-x-6 gap-y-1'>
        <span>
          <span className='text-gray-400 mr-1'>Group ID:</span>
          <code className='bg-white border border-gray-200 px-2 py-0.5 rounded text-xs'>
            {group.groupId}
          </code>
        </span>
        <span>
          <span className='text-gray-400 mr-1'>Bot Token:</span>
          <span className='font-mono text-xs'>
            {group.botToken.slice(0, 8)}••••••••
          </span>
        </span>
      </div>

      {/* Channels Table */}
      <div className='flex justify-between items-center mb-3'>
        <span className='font-semibold text-gray-700'></span>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          size='middle'
          onClick={() => setAddModal(true)}>
          Thêm kênh
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={groupChannels}
        rowKey='_id'
        loading={groupChannelsQuery.isLoading}
        bordered
        scroll={{ y: 'calc(100vh - 400px)' }}
        locale={{
          emptyText: <Empty description='Chưa có kênh nào trong group này' />,
        }}
        pagination={
          groupChannels.length > 10
            ? {
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `${total} kênh`,
              }
            : false
        }
      />

      {/* Add Channel Modal */}
      <AddChannelModal
        open={addModal}
        loading={addGroupToChannelMutation.isPending}
        existingIds={groupChannels.map((c) => c._id)}
        allChannels={allChannels}
        onCancel={() => setAddModal(false)}
        onConfirm={handleAddChannels}
      />
    </div>
  );
};

export default GroupDetailPage;
