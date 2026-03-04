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
  YoutubeOutlined,
  CalendarOutlined,
  TeamOutlined,
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

const formatToLink = (id: string) => {
  if (!id) return '';
  if (id.startsWith('@')) return `https://t.me/${id.slice(1)}`;
  if (id.startsWith('-100')) return `https://t.me/c/${id.slice(4)}`;
  if (id.startsWith('-')) return `https://web.telegram.org/k/#${id}`;
  return id;
};

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
      title={
        <div className='flex items-center gap-2 py-0.5'>
          <PlusOutlined className='text-blue-500' />
          <span className='font-semibold text-gray-800 text-base'>
            Thêm kênh vào Group
          </span>
        </div>
      }
      footer={
        <div className='p-3 border-t bg-gray-50 rounded-b-xl flex gap-3'>
          <Button
            onClick={onCancel}
            className='flex-1 h-10 rounded-lg hover:bg-white text-sm'>
            Hủy
          </Button>
          <Button
            type='primary'
            loading={loading}
            onClick={() => onConfirm(selected)}
            disabled={selected.length === 0}
            className='flex-1 h-10 font-normal shadow-md shadow-blue-100 rounded-lg text-sm border-none'>
            Thêm {selected.length > 0 ? `(${selected.length})` : ''}
          </Button>
        </div>
      }
      destroyOnClose
      width={420}
      styles={{
        content: { padding: 0 },
        header: {
          padding: '12px 20px',
          borderBottom: '1px solid #f0f0f0',
          margin: 0,
        },
        body: { padding: '16px 20px' },
        footer: { margin: 0 },
      }}>
      <div className='mt-1'>
        <p className='text-[11px] text-gray-400 mb-2 font-medium uppercase tracking-tight'>
          CHỌN KÊNH TRONG DANH SÁCH
        </p>
        <Select
          mode='multiple'
          className='w-full'
          placeholder='Tìm theo link youtube...'
          value={selected}
          onChange={setSelected}
          showSearch
          size='middle'
          filterOption={(input, opt) =>
            (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={available.map((ch) => ({
            value: ch._id,
            label: `https://www.youtube.com/${ch.channelId}`,
          }))}
          notFoundContent={
            <div className='py-4 text-center'>
              <p className='text-gray-400 text-xs italic mb-0'>
                {available.length === 0
                  ? 'Tất cả kênh hiện có đã thuộc group này'
                  : 'Không tìm thấy kênh phù hợp'}
              </p>
            </div>
          }
          style={{ borderRadius: '8px' }}
        />
      </div>
    </Modal>
  );
};

const MaskedToken = ({ value }: { value: string }) => {
  const [show, setShow] = React.useState(false);
  if (!value)
    return <span className='text-gray-400 italic text-xs'>Chưa cấu hình</span>;
  const masked = `${value.slice(0, 4)}${'•'.repeat(10)}${value.slice(-4)}`;
  return (
    <span
      className='font-mono text-xs cursor-pointer hover:text-blue-500 select-none'
      onClick={() => setShow((p) => !p)}
      title='Click để ẩn/hiện'>
      {show ? value : masked}
    </span>
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
      title: (
        <div className='flex items-center gap-2'>
          <YoutubeOutlined className='text-red-500' />
          <span>Kênh YouTube</span>
        </div>
      ),
      dataIndex: 'channelId',
      key: 'channelId',
      render: (channelId: string) => {
        const link = `https://www.youtube.com/${channelId}`;
        return (
          <div className='flex items-center gap-2'>
            <Link
              href={link}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 font-medium'>
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
      title: (
        <div className='flex items-center gap-2'>
          <YoutubeOutlined className='text-red-500' />
          <span>Video mới nhất</span>
        </div>
      ),
      dataIndex: 'lastVideoId',
      key: 'lastVideoId',
      width: 150,
      render: (lastVideoId: string) => {
        if (!lastVideoId) {
          return (
            <Tooltip
              title='Vui lòng thêm Bot vào Telegram Group để tự động cập nhật video mới!'
              placement='top'>
              <Tag
                color='default'
                className='border-none bg-gray-100 text-gray-400'>
                Trống
              </Tag>
            </Tooltip>
          );
        }

        const videoLink = `https://www.youtube.com/watch?v=${lastVideoId}`;
        return (
          <Button
            type='link'
            size='small'
            className='h-auto flex items-center gap-1.5 font-medium'
            onClick={() => window.open(videoLink, '_blank')}>
            <LinkOutlined className='text-xs' />
            Xem ngay
          </Button>
        );
      },
    },
    {
      title: (
        <div className='flex items-center gap-2'>
          <CalendarOutlined className='text-blue-500' />
          <span>Ngày đăng cuối</span>
        </div>
      ),
      dataIndex: 'lastVideoAt',
      key: 'lastVideoAt',
      width: 180,
      render: (lastVideoAt: string) => {
        if (!lastVideoAt) {
          return (
            <Tooltip
              title='Vui lòng thêm Bot vào Telegram Group để tự động cập nhật video mới!'
              placement='top'>
              <Tag
                color='default'
                className='border-none bg-gray-100 text-gray-400'>
                Trống
              </Tag>
            </Tooltip>
          );
        }

        const dt = dayjs(lastVideoAt);
        return (
          <div className='flex flex-col leading-tight'>
            <span className='text-sm'>{dt.format('HH:mm DD/MM/YY')}</span>
            <span className='mt-1 text-xs text-gray-400 font-normal'>
              ({dt.fromNow()})
            </span>
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
          <Tooltip title='Xóa khỏi group' mouseEnterDelay={0.3}>
            <Button
              type='text'
              size='small'
              danger
              icon={<DeleteOutlined />}
              className='h-8 w-8 flex items-center justify-center'
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  if (groupQuery.isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spin size='large' />
      </div>
    );
  }

  if (!group) {
    return (
      <div className='max-w-6xl mx-auto mt-10 p-12 bg-white rounded-2xl shadow-xl border border-blue-50 text-center'>
        <Empty description='Group không tồn tại' />
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/groups')}
          className='mt-4 h-10 rounded-lg'>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto mt-10 mb-10 bg-white px-8 py-6 rounded-2xl shadow-xl shadow-blue-50/50 border border-blue-50'>
      {/* Header Styled like Groups list */}
      <div className='flex justify-between items-center mb-8'>
        <div className='flex items-center gap-3'>
          <Button
            type='text'
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/groups')}
            className='h-8 w-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg mr-2'
          />
          <div className='bg-blue-600 h-6 w-1 rounded-full'></div>
          <h1 className='text-xl font-semibold text-gray-800 mb-0 flex items-center gap-2'>
            {group.name}
            <Tag
              color='blue'
              className='ml-1 font-semibold bg-blue-50 border-blue-100 text-blue-600 rounded px-1.5 text-[11px] h-5 flex items-center'>
              {groupChannels.length} kênh
            </Tag>
          </h1>
        </div>

        <Button
          type='primary'
          size='small'
          icon={<PlusOutlined />}
          onClick={() => setAddModal(true)}
          className='h-9 px-5 font-normal bg-blue-600 hover:bg-blue-700 border-none shadow-md shadow-blue-100 hover:scale-[1.01] transition-all rounded-lg flex items-center justify-center text-sm'>
          Thêm kênh mới
        </Button>
      </div>

      {/* Condensed Info Row */}
      <div className='flex flex-wrap items-center gap-x-8 gap-y-2 mb-6 px-2 py-2 border-b border-gray-50'>
        <div className='flex items-center gap-2'>
          <LinkOutlined className='text-blue-400 text-xs' />
          <span className='text-[11px] text-gray-400 font-semibold uppercase tracking-wider'>
            Tele:
          </span>
          {group.groupId ? (
            <a
              href={formatToLink(group.groupId)}
              target='_blank'
              rel='noreferrer'
              className='text-xs font-medium text-blue-500 hover:underline truncate max-w-[200px]'>
              {group.groupId}
            </a>
          ) : (
            <span className='text-xs italic text-gray-300'>Chưa có</span>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <TeamOutlined className='text-amber-400 text-xs' />
          <span className='text-[11px] text-gray-400 font-semibold uppercase tracking-wider'>
            Bot:
          </span>
          <MaskedToken value={group.botToken} />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={groupChannels.map((item) => ({ ...item, key: item._id }))}
        loading={groupChannelsQuery.isLoading}
        pagination={{ pageSize: 8, hideOnSinglePage: true }}
        bordered
        scroll={{ y: 'calc(100vh - 400px)' }}
        className='premium-table'
      />

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
