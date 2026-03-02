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
  TeamOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useGroupService } from '../../hooks/useGroupService';
import type { TelegramGroup } from '../../types/group';
import type { ColumnsType } from 'antd/es/table';

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
        groupId: initialValues?.groupId ?? '',
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
          label='Telegram Group ID'
          extra='Negative number ID, vd: -1001234567890'
          rules={[
            { required: true, message: 'Vui lòng nhập Group ID!' },
            {
              pattern: /^-?\d+$/,
              message: 'Group ID phải là số nguyên (âm hoặc dương)!',
            },
          ]}>
          <Input placeholder='-1001234567890' className='h-10' />
        </Form.Item>

        <Form.Item
          name='botToken'
          label='Bot Token'
          rules={[
            { required: true, message: 'Vui lòng nhập Bot Token!' },
            {
              pattern: /^[0-9]{8,10}:[a-zA-Z0-9_-]{35}$/,
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
    if (groupModal.editing?._id) {
      updateGroupMutation.mutate(
        { id: groupModal.editing._id, dto: values },
        {
          onSuccess: () => {
            message.success('Đã cập nhật group!');
            setGroupModal({ open: false, editing: null });
          },
          onError: () => message.error('Cập nhật group thất bại!'),
        },
      );
    } else {
      createGroupMutation.mutate(values, {
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
          className='font-semibold text-blue-600 cursor-pointer hover:underline'
          onClick={() => router.push(`/groups/${record._id}`)}>
          <TeamOutlined className='mr-2' />
          {name}
        </span>
      ),
    },
    {
      title: 'Group ID',
      dataIndex: 'groupId',
      key: 'groupId',
      width: 180,
      render: (id: string) => (
        <code className='bg-gray-100 px-2 py-0.5 rounded text-xs'>{id}</code>
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
        <div className='flex items-center gap-1 justify-center'>
          <Tooltip title='Quản lý kênh'>
            <Button
              type='default'
              size='small'
              icon={<EyeOutlined />}
              onClick={() => router.push(`/groups/${record._id}`)}>
              Chi tiết
            </Button>
          </Tooltip>
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
