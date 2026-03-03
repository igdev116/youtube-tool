'use client';

import React from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Table,
  Tag,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  ArrowRightOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useGroupService } from '../../hooks/useGroupService';
import type { TelegramGroup } from '../../types/group';
import type { ColumnsType } from 'antd/es/table';

// ----------- Helpers -----------
const parseTelegramId = (input: string) => {
  let v = input.trim();
  // https://web.telegram.org/k/#-5079958874
  if (v.includes('web.telegram.org')) {
    const match = v.match(/#(-?\d+)/);
    if (match) return match[1];
  }
  // Private group link: https://t.me/c/1234567890/123 -> -1001234567890
  if (v.includes('t.me/c/')) {
    const match = v.match(/t\.me\/c\/(\d+)/);
    if (match) return `-100${match[1]}`;
  }
  // Public link: https://t.me/groupname -> @groupname
  if (v.includes('t.me/')) {
    const parts = v.split('/');
    const last = parts.filter(Boolean).pop();
    if (last && !/^\d+$/.test(last)) {
      return last.startsWith('@') ? last : `@${last}`;
    }
  }
  return v;
};

const formatToLink = (id: string) => {
  if (!id) return '';
  if (id.startsWith('@')) return `https://t.me/${id.slice(1)}`;
  if (id.startsWith('-100')) return `https://t.me/c/${id.slice(4)}`;
  // Fallback for numeric IDs that don't follow the standard private group format
  // Or if it was original web.telegram.org format, we can only do a best effort.
  // We'll return it as is if it doesn't match above, but the user expects a link.
  if (id.startsWith('-')) return `https://web.telegram.org/k/#${id}`;
  return id;
};

// ----------- Masked Token component -----------
const MaskedToken = ({ value }: { value: string }) => {
  const [show, setShow] = React.useState(false);
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

// ----------- Create/Edit Group Modal -----------
interface GroupFormModalProps {
  open: boolean;
  loading: boolean;
  initialValues?: Partial<TelegramGroup>;
  onCancel: () => void;
  onFinish: (values: {
    name: string;
    groupId: string;
    botToken: string;
  }) => void;
}

const GroupFormModal = ({
  open,
  loading,
  initialValues,
  onCancel,
  onFinish,
}: GroupFormModalProps) => {
  const [form] = Form.useForm();
  const isEdit = !!initialValues?._id;

  React.useEffect(() => {
    if (open) {
      form.setFieldsValue({
        name: initialValues?.name ?? '',
        groupId: initialValues?.groupId
          ? formatToLink(initialValues.groupId)
          : '',
        botToken: initialValues?.botToken ?? '',
      });
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={isEdit ? 'Chỉnh sửa Group' : 'Tạo Group mới'}
      footer={null}
      destroyOnHidden
      width={520}>
      <Form form={form} layout='vertical' onFinish={onFinish} className='mt-4'>
        <Form.Item
          name='name'
          label='Tên Group'
          rules={[{ required: true, message: 'Vui lòng nhập tên group!' }]}>
          <Input placeholder='Ví dụ: Gaming Việt Nam' className='h-10' />
        </Form.Item>

        <Form.Item
          name='groupId'
          label='Link Telegram Group'
          extra='Ví dụ: https://web.telegram.org/k/#-5079958874'
          rules={[
            { required: true, message: 'Vui lòng dán link Telegram Group!' },
          ]}>
          <Input
            placeholder='https://web.telegram.org/k/#-5079958874'
            className='h-10'
          />
        </Form.Item>

        <Form.Item
          name='botToken'
          label='Bot Token'
          rules={[
            { required: true, message: 'Vui lòng nhập Bot Token!' },
            {
              pattern: /^[0-9]{8,11}:[a-zA-Z0-9_-]{35}$/,
              message: 'Định dạng không đúng! (vd: 123456789:ABCdef...)',
            },
          ]}>
          <Input.Password
            placeholder='Nhập Bot Token từ BotFather'
            className='h-10'
          />
        </Form.Item>

        <Form.Item className='mb-0'>
          <div className='flex gap-2 justify-end'>
            <Button onClick={onCancel}>Huỷ</Button>
            <Button type='primary' htmlType='submit' loading={loading}>
              {isEdit ? 'Lưu thay đổi' : 'Tạo Group'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ============= Main Groups Page =============
const GroupsPage = () => {
  const router = useRouter();
  const {
    useQueryGetGroups,
    createGroupMutation,
    updateGroupMutation,
    deleteGroupMutation,
  } = useGroupService();

  const groupsQuery = useQueryGetGroups();
  const groups: TelegramGroup[] = groupsQuery.data?.result || [];

  const [groupModal, setGroupModal] = React.useState<{
    open: boolean;
    editing: Partial<TelegramGroup> | null;
  }>({ open: false, editing: null });

  const handleCreateOrUpdate = (values: {
    name: string;
    groupId: string;
    botToken: string;
  }) => {
    const processedValues = {
      ...values,
      groupId: parseTelegramId(values.groupId),
    };

    if (groupModal.editing?._id) {
      updateGroupMutation.mutate(
        { id: groupModal.editing._id, dto: processedValues },
        {
          onSuccess: () => {
            message.success('Đã cập nhật group!');
            setGroupModal({ open: false, editing: null });
          },
          onError: () => message.error('Cập nhật group thất bại!'),
        },
      );
    } else {
      createGroupMutation.mutate(processedValues, {
        onSuccess: () => {
          message.success('Đã tạo group!');
          setGroupModal({ open: false, editing: null });
        },
        onError: () => message.error('Tạo group thất bại!'),
      });
    }
  };

  const handleDeleteGroup = (id: string) => {
    deleteGroupMutation.mutate(id, {
      onSuccess: () => message.success('Đã xóa group!'),
      onError: () => message.error('Xóa group thất bại!'),
    });
  };

  const columns: ColumnsType<TelegramGroup> = [
    {
      title: 'Tên Group',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <span
          className='font-semibold text-blue-600 cursor-pointer hover:underline flex items-center gap-1 group'
          onClick={() => router.push(`/groups/${record._id}`)}>
          {name}
          <ArrowRightOutlined className='text-[10px] opacity-0 group-hover:opacity-100 transition-opacity translate-y-[1px]' />
        </span>
      ),
    },
    {
      title: 'Link Telegram Group',
      dataIndex: 'groupId',
      key: 'groupId',
      width: 400,
      render: (id: string) => (
        <a
          href={formatToLink(id)}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-500 hover:underline flex items-center gap-1'>
          <LinkOutlined className='text-xs' />
          {formatToLink(id)}
        </a>
      ),
    },
    {
      title: 'Bot Token',
      dataIndex: 'botToken',
      key: 'botToken',
      width: 260,
      render: (token: string) => <MaskedToken value={token} />,
    },
    {
      title: 'Số kênh',
      dataIndex: 'channelCount',
      key: 'channelCount',
      align: 'center',
      width: 120,
      render: (count: number) => (
        <Tag color='blue' className='text-sm px-3'>
          {count ?? 0} kênh
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <div className='flex items-center gap-2 justify-center'>
          <Tooltip title='Chỉnh sửa'>
            <Button
              type='text'
              size='small'
              icon={<EditOutlined />}
              onClick={() => setGroupModal({ open: true, editing: record })}
            />
          </Tooltip>
          <Popconfirm
            title='Xóa group này?'
            description='Kênh YouTube sẽ không còn thuộc group này.'
            onConfirm={() => handleDeleteGroup(record._id)}
            okText='Xóa'
            cancelText='Huỷ'
            okButtonProps={{ danger: true }}>
            <Button
              type='text'
              size='small'
              danger
              icon={<DeleteOutlined />}
              loading={
                deleteGroupMutation.isPending &&
                deleteGroupMutation.variables === record._id
              }
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className='max-w-6xl mx-auto mt-10 mb-10 bg-white px-6 py-4 rounded-lg shadow-lg'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-center mb-0 text-2xl font-bold'>
          Quản lý Groups{' '}
          <span className='text-primary'>({groups.length} groups)</span>
        </h2>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => setGroupModal({ open: true, editing: null })}>
          Tạo Group
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={groups}
        rowKey='_id'
        loading={groupsQuery.isLoading}
        bordered
        scroll={{ y: 'calc(100vh - 320px)' }}
        pagination={
          groups.length > 10
            ? {
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `${total} groups`,
              }
            : false
        }
      />

      {/* Create/Edit modal */}
      <GroupFormModal
        open={groupModal.open}
        loading={createGroupMutation.isPending || updateGroupMutation.isPending}
        initialValues={groupModal.editing ?? undefined}
        onCancel={() => setGroupModal({ open: false, editing: null })}
        onFinish={handleCreateOrUpdate}
      />
    </div>
  );
};

export default GroupsPage;
