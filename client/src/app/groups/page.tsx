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
  TeamOutlined,
  InfoCircleOutlined,
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

  // Sync form values when modal opens or initialValues change
  React.useEffect(() => {
    if (open) {
      form.setFieldsValue({
        ...initialValues,
        groupId: initialValues?.groupId
          ? formatToLink(initialValues.groupId)
          : '',
      });
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <div className='flex items-center gap-2 py-1'>
          <TeamOutlined className='text-blue-500' />
          <span className='font-semibold text-gray-800 text-lg'>
            {isEdit ? 'Chỉnh sửa Group' : 'Tạo Group mới'}
          </span>
        </div>
      }
      footer={
        <div className='p-4 border-t bg-gray-50 rounded-b-xl flex gap-3'>
          <Button
            onClick={onCancel}
            block
            size='large'
            className='h-11 rounded-lg hover:bg-white text-sm'>
            Hủy
          </Button>
          <Button
            type='primary'
            form='group_form'
            htmlType='submit'
            block
            size='large'
            loading={loading}
            className='h-11 font-normal bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 rounded-lg text-sm'>
            {isEdit ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      }
      destroyOnClose
      width={440}
      styles={{
        content: { padding: 0 },
        header: {
          padding: '12px 20px',
          borderBottom: '1px solid #f0f0f0',
          margin: 0,
        },
        body: { padding: '20px' },
        footer: { margin: 0 },
      }}>
      <Form
        form={form}
        id='group_form'
        layout='vertical'
        onFinish={onFinish}
        initialValues={{
          ...initialValues,
          groupId: initialValues?.groupId
            ? formatToLink(initialValues.groupId)
            : '',
        }}>
        <Form.Item
          name='name'
          label={<span className='font-semibold text-gray-600'>Tên Group</span>}
          rules={[{ required: true, message: 'Vui lòng nhập tên group!' }]}>
          <Input
            placeholder='Ví dụ: Gaming Việt Nam'
            className='h-10 rounded-lg'
          />
        </Form.Item>

        <Form.Item
          name='groupId'
          label={
            <span className='font-semibold text-gray-600'>Link Telegram Group</span>
          }>
          <Input
            placeholder='https://web.telegram.org/k/#-5079958874'
            className='h-10 rounded-lg'
          />
        </Form.Item>

        <Form.Item
          name='botToken'
          label={<span className='font-semibold text-gray-600'>Bot Token</span>}
          extra={
            <span className='text-[11px] text-gray-400 italic mt-1 block'>
              Có thể điền sau (vd: 123456789:ABCdef...)
            </span>
          }
          rules={[
            {
              pattern: /^[0-9]{8,11}:[a-zA-Z0-9_-]{35}$/,
              message: 'Định dạng không đúng!',
            },
          ]}>
          <Input
            placeholder='123456789:ABCdef...'
            className='h-10 rounded-lg'
          />
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
      render: (id: string) => {
        if (!id)
          return (
            <span className='text-gray-400 italic text-xs'>Chưa cấu hình</span>
          );
        const link = formatToLink(id);
        return (
          <a
            href={link}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-500 hover:underline flex items-center gap-1'>
            <LinkOutlined className='text-xs' />
            {link}
          </a>
        );
      },
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
            description={
              <div>
                Kênh YouTube sẽ không còn thuộc group này.
                <br />
                <span className='text-red-500'>
                  (Chỉ xoá group chứ ko xoá các kênh bên trong group)
                </span>
              </div>
            }
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
    <div className='max-w-6xl mx-auto mt-10 mb-10 bg-white px-8 py-6 rounded-2xl shadow-xl shadow-blue-50/50 border border-blue-50'>
      <div className='flex justify-between items-center mb-8'>
        <div className='flex items-center gap-3'>
          <div className='bg-blue-600 h-6 w-1 rounded-full'></div>
          <h1 className='text-xl font-semibold text-gray-800 mb-0 flex items-center gap-2'>
            Quản lý Nhóm
            <Tag
              color='blue'
              className='ml-1 font-semibold bg-blue-50 border-blue-100 text-blue-600 rounded px-1.5 text-[11px] h-5 flex items-center'>
              {groups.length} nhóm
            </Tag>
          </h1>
        </div>

        <Button
          type='primary'
          size='small'
          icon={<PlusOutlined />}
          onClick={() => setGroupModal({ open: true, editing: null })}
          className='h-10 px-5 font-normal bg-blue-600 hover:bg-blue-700 border-none shadow-md shadow-blue-100 hover:scale-[1.01] transition-all rounded-lg flex items-center justify-center text-sm'>
          Tạo Group mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={groups.map((g) => ({ ...g, key: g._id }))}
        loading={groupsQuery.isLoading}
        pagination={{ pageSize: 8, hideOnSinglePage: true }}
        bordered
        scroll={{ y: 'calc(100vh - 350px)' }}
        className='premium-table'
      />

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
