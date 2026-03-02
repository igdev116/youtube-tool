'use client';

import React from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Collapse,
  Tag,
  Tooltip,
  Popconfirm,
  Empty,
  Spin,
  Select,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  TeamOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useGroupService } from '../../hooks/useGroupService';
import { useChannelService } from '../../hooks/useChannelService';
import type { TelegramGroup } from '../../types/group';
import type { ChannelListItem } from '../../types/channel';

const { Panel } = Collapse;

// ----------- Small reusable mask component -----------
const MaskedText = ({ value }: { value: string }) => {
  const [show, setShow] = React.useState(false);
  const display = show
    ? value
    : `${value.slice(0, 4)}${'•'.repeat(Math.min(value.length - 8, 12))}${value.slice(-4)}`;
  return (
    <span
      className='font-mono text-xs cursor-pointer hover:text-primary'
      onClick={() => setShow((p) => !p)}
      title='Click để ẩn/hiện'>
      {show ? value : display}
    </span>
  );
};

// ----------- Group Form Modal -----------
interface GroupFormModalProps {
  open: boolean;
  loading: boolean;
  initialValues?: Partial<TelegramGroup>;
  onCancel: () => void;
  onFinish: (values: {
    name: string;
    groupLink: string;
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
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name || '',
          groupLink: initialValues.groupId
            ? `https://web.telegram.org/k/#${initialValues.groupId}`
            : '',
          botToken: initialValues.botToken || '',
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={isEdit ? 'Chỉnh sửa Group' : 'Tạo Group mới'}
      footer={null}
      destroyOnHidden>
      <Form form={form} layout='vertical' onFinish={onFinish} className='mt-4'>
        <Form.Item
          name='name'
          label='Tên Group'
          rules={[{ required: true, message: 'Vui lòng nhập tên group!' }]}>
          <Input placeholder='Ví dụ: Kênh Gaming' className='h-10' />
        </Form.Item>

        <Form.Item
          name='groupLink'
          label='Link Telegram Group'
          extra='Mở group trên web.telegram.org → copy link từ thanh URL'
          rules={[
            { required: true, message: 'Vui lòng nhập link group!' },
            {
              validator: (_, value) => {
                const re = /^https:\/\/web\.telegram\.org\/k\/#-?\w+$/;
                if (value && !re.test(value))
                  return Promise.reject(
                    new Error(
                      'Định dạng không đúng! (vd: https://web.telegram.org/k/#-1001234567890)',
                    ),
                  );
                return Promise.resolve();
              },
            },
          ]}>
          <Input
            placeholder='https://web.telegram.org/k/#-1001234567890'
            className='h-10'
          />
        </Form.Item>

        <Form.Item
          name='botToken'
          label='Bot Token'
          rules={[
            { required: true, message: 'Vui lòng nhập Bot Token!' },
            {
              validator: (_, value) => {
                const re = /^[0-9]{8,10}:[a-zA-Z0-9_-]{35}$/;
                if (value && !re.test(value))
                  return Promise.reject(
                    new Error(
                      'Định dạng không đúng! (vd: 123456789:ABCdefGH...)',
                    ),
                  );
                return Promise.resolve();
              },
            },
          ]}>
          <Input.Password
            placeholder='Nhập Bot Token của BotFather'
            className='h-10'
          />
        </Form.Item>

        <Form.Item className='mb-0 flex justify-end'>
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

// ----------- Add Channel Modal -----------
interface AddChannelModalProps {
  open: boolean;
  loading: boolean;
  existingChannelIds: string[];
  allChannels: ChannelListItem[];
  onCancel: () => void;
  onFinish: (channelIds: string[]) => void;
}

const AddChannelModal = ({
  open,
  loading,
  existingChannelIds,
  allChannels,
  onCancel,
  onFinish,
}: AddChannelModalProps) => {
  const [selected, setSelected] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (open) setSelected([]);
  }, [open]);

  const availableChannels = allChannels.filter(
    (ch) => !existingChannelIds.includes(ch.channelId),
  );

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title='Thêm kênh YouTube vào Group'
      onOk={() => onFinish(selected)}
      okText='Thêm'
      cancelText='Huỷ'
      confirmLoading={loading}
      okButtonProps={{ disabled: selected.length === 0 }}
      destroyOnHidden>
      <Select
        mode='multiple'
        className='w-full mt-3'
        placeholder='Chọn kênh để thêm vào group...'
        value={selected}
        onChange={setSelected}
        showSearch
        filterOption={(input, opt) =>
          (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={availableChannels.map((ch) => ({
          value: ch.channelId,
          label: `youtube.com/${ch.channelId}`,
        }))}
        notFoundContent={
          availableChannels.length === 0
            ? 'Tất cả kênh đã được thêm vào group này'
            : 'Không tìm thấy'
        }
      />
    </Modal>
  );
};

// ============= Main Page =============
const GroupsPage = () => {
  const {
    useQueryGetGroups,
    createGroupMutation,
    updateGroupMutation,
    deleteGroupMutation,
    addChannelsMutation,
    removeChannelMutation,
  } = useGroupService();

  const { useQueryGetListChannels } = useChannelService();

  const groupsQuery = useQueryGetGroups();
  const groups: TelegramGroup[] = groupsQuery.data?.result || [];

  // Load all channels for the add-channel modal (first 500)
  const channelsQuery = useQueryGetListChannels({
    page: 1,
    limit: 500,
  });
  const allChannels: ChannelListItem[] =
    channelsQuery.data?.result?.content || [];

  // Group CRUD modal state
  const [groupModal, setGroupModal] = React.useState<{
    open: boolean;
    editing: Partial<TelegramGroup> | null;
  }>({ open: false, editing: null });

  // Add channel modal state
  const [addChModal, setAddChModal] = React.useState<{
    open: boolean;
    groupId: string;
    existingChannelIds: string[];
  }>({ open: false, groupId: '', existingChannelIds: [] });

  const parseGroupIdFromLink = (link: string) =>
    link.replace('https://web.telegram.org/k/#', '');

  const handleCreateOrUpdate = (values: {
    name: string;
    groupLink: string;
    botToken: string;
  }) => {
    const groupId = parseGroupIdFromLink(values.groupLink);

    if (groupModal.editing?._id) {
      updateGroupMutation.mutate(
        {
          id: groupModal.editing._id,
          dto: { name: values.name, groupId, botToken: values.botToken },
        },
        {
          onSuccess: () => {
            message.success('Đã cập nhật group!');
            setGroupModal({ open: false, editing: null });
          },
          onError: () => message.error('Cập nhật group thất bại!'),
        },
      );
    } else {
      createGroupMutation.mutate(
        { name: values.name, groupId, botToken: values.botToken },
        {
          onSuccess: () => {
            message.success('Đã tạo group!');
            setGroupModal({ open: false, editing: null });
          },
          onError: () => message.error('Tạo group thất bại!'),
        },
      );
    }
  };

  const handleDeleteGroup = (id: string) => {
    deleteGroupMutation.mutate(id, {
      onSuccess: () => message.success('Đã xóa group!'),
      onError: () => message.error('Xóa group thất bại!'),
    });
  };

  const handleAddChannels = (channelIds: string[]) => {
    addChannelsMutation.mutate(
      { id: addChModal.groupId, channelIds },
      {
        onSuccess: () => {
          message.success(`Đã thêm ${channelIds.length} kênh!`);
          setAddChModal({ open: false, groupId: '', existingChannelIds: [] });
        },
        onError: () => message.error('Thêm kênh thất bại!'),
      },
    );
  };

  const handleRemoveChannel = (groupId: string, channelId: string) => {
    removeChannelMutation.mutate(
      { id: groupId, channelId },
      {
        onSuccess: () => message.success('Đã xóa kênh khỏi group!'),
        onError: () => message.error('Xóa kênh thất bại!'),
      },
    );
  };

  if (groupsQuery.isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto mt-10 px-4 pb-10'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold mb-0'>
          <TeamOutlined className='mr-2 text-primary' />
          Quản lý Groups{' '}
          <span className='text-primary text-xl'>({groups.length} groups)</span>
        </h2>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => setGroupModal({ open: true, editing: null })}>
          Tạo Group
        </Button>
      </div>

      {/* Groups list */}
      {groups.length === 0 ? (
        <div className='bg-white rounded-lg shadow-sm p-12'>
          <Empty
            description={
              <span>
                Chưa có group nào.{' '}
                <a onClick={() => setGroupModal({ open: true, editing: null })}>
                  Tạo group đầu tiên
                </a>
              </span>
            }
          />
        </div>
      ) : (
        <Collapse
          accordion={false}
          className='bg-white shadow-sm rounded-lg overflow-hidden'
          expandIconPosition='start'>
          {groups.map((group) => (
            <Panel
              key={group._id}
              header={
                <div className='flex items-center justify-between w-full pr-2'>
                  <div className='flex items-center gap-3'>
                    <TeamOutlined className='text-primary' />
                    <span className='font-semibold text-base'>
                      {group.name}
                    </span>
                    <Tag color='blue'>{group.channelIds.length} kênh</Tag>
                  </div>
                  <div
                    className='flex items-center gap-1'
                    onClick={(e) => e.stopPropagation()}>
                    <Tooltip title='Chỉnh sửa group'>
                      <Button
                        type='text'
                        size='small'
                        icon={<EditOutlined />}
                        onClick={() =>
                          setGroupModal({ open: true, editing: group })
                        }
                      />
                    </Tooltip>
                    <Popconfirm
                      title='Xóa group này?'
                      description='Tất cả kênh trong group sẽ bị bỏ ra khỏi group này.'
                      onConfirm={() => handleDeleteGroup(group._id)}
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
                          deleteGroupMutation.variables === group._id
                        }
                      />
                    </Popconfirm>
                  </div>
                </div>
              }>
              {/* Group info */}
              <div className='mb-4 bg-gray-50 rounded-md p-3 text-sm space-y-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-gray-500 w-24'>Group ID:</span>
                  <code className='bg-gray-100 px-2 py-0.5 rounded text-xs'>
                    {group.groupId}
                  </code>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-gray-500 w-24'>Bot Token:</span>
                  <MaskedText value={group.botToken} />
                </div>
              </div>

              {/* Channels section */}
              <div>
                <div className='flex items-center justify-between mb-3'>
                  <span className='font-medium text-sm text-gray-600'>
                    Kênh YouTube trong group
                  </span>
                  <Button
                    size='small'
                    type='dashed'
                    icon={<PlusOutlined />}
                    onClick={() =>
                      setAddChModal({
                        open: true,
                        groupId: group._id,
                        existingChannelIds: group.channelIds,
                      })
                    }>
                    Thêm kênh
                  </Button>
                </div>

                {group.channelIds.length === 0 ? (
                  <div className='text-gray-400 text-sm text-center py-4'>
                    Chưa có kênh nào.{' '}
                    <a
                      onClick={() =>
                        setAddChModal({
                          open: true,
                          groupId: group._id,
                          existingChannelIds: group.channelIds,
                        })
                      }>
                      Thêm ngay
                    </a>
                  </div>
                ) : (
                  <div className='flex flex-col gap-1'>
                    {group.channelIds.map((chId) => (
                      <div
                        key={chId}
                        className='flex items-center justify-between bg-gray-50 hover:bg-blue-50 rounded px-3 py-1.5 transition'>
                        <a
                          href={`https://www.youtube.com/${chId}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm flex items-center gap-1.5 text-gray-700 hover:text-blue-500'>
                          <LinkOutlined className='text-xs' />
                          youtube.com/{chId}
                        </a>
                        <Popconfirm
                          title='Xóa kênh này khỏi group?'
                          onConfirm={() => handleRemoveChannel(group._id, chId)}
                          okText='Xóa'
                          cancelText='Huỷ'
                          okButtonProps={{ danger: true }}>
                          <Button
                            type='text'
                            size='small'
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>
          ))}
        </Collapse>
      )}

      {/* Create/Edit group modal */}
      <GroupFormModal
        open={groupModal.open}
        loading={createGroupMutation.isPending || updateGroupMutation.isPending}
        initialValues={groupModal.editing ?? undefined}
        onCancel={() => setGroupModal({ open: false, editing: null })}
        onFinish={handleCreateOrUpdate}
      />

      {/* Add channel modal */}
      <AddChannelModal
        open={addChModal.open}
        loading={addChannelsMutation.isPending}
        existingChannelIds={addChModal.existingChannelIds}
        allChannels={allChannels}
        onCancel={() =>
          setAddChModal({ open: false, groupId: '', existingChannelIds: [] })
        }
        onFinish={handleAddChannels}
      />
    </div>
  );
};

export default GroupsPage;
