'use client';

import React from 'react';
import {
  Table,
  Switch,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Checkbox,
  message,
  Tag,
  Tooltip,
  Select,
  Popconfirm,
} from 'antd';
import { useChannelService } from '../hooks/useChannelService';
import { useGroupService } from '../hooks/useGroupService';
import type { ChannelListItem } from '../types/channel';
import { ChannelSortKey } from '../types/channel';

import {
  DeleteOutlined,
  UploadOutlined,
  PlusOutlined,
  CopyOutlined,
  LinkOutlined,
  StarOutlined,
  StarFilled,
  FolderOutlined,
  FolderAddOutlined,
  InfoCircleOutlined,
  YoutubeOutlined,
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  TableOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { toastSuccess, toastError } from '../utils/toast';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import { TOOLTIP_MESSAGES } from '../constants';
import { useUserService } from '../hooks/useUserService';
import { useUserStore } from '../store/userStore';
import { useRouter } from 'next/navigation';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Link } = Typography;

const HomePage = () => {
  const router = useRouter();
  const {
    useQueryGetListChannels,
    deleteChannelMutation,
    addChannelsMutation,
    toggleChannelMutation,
    invalidateChannels,
    deleteMultipleChannels,
    deleteAllChannels,
    useMutationExportChannels,
    addGroupToChannelMutation,
    removeGroupFromChannelMutation,
  } = useChannelService();

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [keyword, setKeyword] = React.useState('');
  const [sort, setSort] = React.useState<ChannelSortKey>(
    ChannelSortKey.NEWEST_UPLOAD,
  );

  // Selected rows state
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = React.useState<ChannelListItem[]>([]);

  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);
  const channelsQuery = useQueryGetListChannels({
    page: currentPage,
    limit: pageSize,
    keyword: keyword || undefined,
    sort,
    favoriteOnly: showFavoritesOnly || undefined,
  });
  const data: ChannelListItem[] = channelsQuery.data?.result?.content || [];
  const total = channelsQuery.data?.result?.paging?.total || 0;
  const hasAnyChannels = total > 0;

  // Modal state
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();
  const [excelLoading, setExcelLoading] = React.useState(false);
  const [channelCount, setChannelCount] = React.useState(1);
  const [selectedGroupIds, setSelectedGroupIds] = React.useState<string[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Assign-to-group modal state
  const [assignGroupModal, setAssignGroupModal] = React.useState<{
    open: boolean;
    channel: ChannelListItem | null;
    selectedGroupIds: string[];
  }>({ open: false, channel: null, selectedGroupIds: [] });

  const GroupCellPlaceholder = ({ record }: { record: ChannelListItem }) => {
    const [tooltipVisible, setTooltipVisible] = React.useState(false);

    const openModal = (e: React.MouseEvent) => {
      e.stopPropagation();
      setTooltipVisible(false);
      setAssignGroupModal({
        open: true,
        channel: record,
        selectedGroupIds: [],
      });
    };

    return (
      <Tooltip
        open={tooltipVisible}
        onOpenChange={setTooltipVisible}
        title={
          <span>
            Hãy{' '}
            <span
              className='text-blue-300 font-semibold underline cursor-pointer'
              onClick={openModal}>
              thêm nhóm
            </span>{' '}
            để nhận những thông báo mới nhất của kênh
          </span>
        }
        placement='topLeft'
        mouseLeaveDelay={0.1}
        destroyTooltipOnHide>
        <div
          className='group flex items-center gap-1.5 cursor-pointer opacity-80 hover:opacity-100 transition-all'
          onClick={openModal}>
          <span className='text-gray-400 leading-tight group-hover:text-blue-500 group-hover:underline decoration-dotted underline-offset-2 transition-colors'>
            Chưa có nhóm
          </span>
          <InfoCircleOutlined className='text-amber-500 text-xs group-hover:scale-110 transition-transform' />
        </div>
      </Tooltip>
    );
  };

  const { useQueryGetGroups, createGroupMutation } = useGroupService();
  const groupsQuery = useQueryGetGroups();
  const groups = groupsQuery.data?.result || [];

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleUploadClick = () => {
    if (!excelLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleToggleChannel = (channelId: string) => {
    toggleChannelMutation.mutate(channelId, {
      onSuccess: (res) => {
        if (res.success) {
          invalidateChannels();
        } else {
          toastError(res.message || 'Cập nhật trạng thái kênh thất bại!');
        }
      },
      onError: (err: any) => {
        toastError(
          err?.response?.data?.message || 'Cập nhật trạng thái kênh thất bại!',
        );
      },
    });
  };

  const handleDelete = (channelId: string) => {
    deleteChannelMutation.mutate(channelId, {
      onSuccess: (res) => {
        if (res.success) {
          toastSuccess('Xoá kênh thành công!');
          invalidateChannels();
        } else {
          toastError(res.message || 'Xoá kênh thất bại!');
        }
      },
      onError: (err: any) => {
        toastError(err?.response?.data?.message || 'Xoá kênh thất bại!');
      },
    });
  };

  const handleDeleteMultiple = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một kênh để xóa!');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} kênh đã chọn?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteMultipleChannels(selectedRowKeys as string[]);
          toastSuccess(`Đã xóa thành công ${selectedRowKeys.length} kênh!`);
          setSelectedRowKeys([]);
          setSelectedRows([]);
        } catch (error) {
          toastError('Có lỗi xảy ra khi xóa kênh!');
        }
      },
    });
  };

  const handleAssignGroup = async (values: string[]) => {
    const channel = assignGroupModal.channel;
    if (!channel || values.length === 0) return;

    try {
      // Logic gán từng nhóm
      for (const value of values) {
        let groupId = value;

        // Nếu là tên nhóm mới (không phải ObjectId), tạo nhóm trước
        if (!/^[0-9a-fA-F]{24}$/.test(value)) {
          const res = await createGroupMutation.mutateAsync({
            name: value.trim(),
          });
          groupId = res?.result?._id as string;
          if (!groupId) throw new Error('Không lấy được ID nhóm mới');
        }

        // Gán vào kênh (đợi gán xong từng cái để tránh race condition hoặc overload nếu muốn, ở đây gọi await để an toàn)
        await addGroupToChannelMutation.mutateAsync({
          channelDbId: channel._id,
          groupId,
        });
      }

      toastSuccess(`Đã thêm kênh vào ${values.length} nhóm thành công!`);
      invalidateChannels();

      // Đóng modal và reset
      setAssignGroupModal({
        open: false,
        channel: null,
        selectedGroupIds: [],
      });
    } catch (err: any) {
      toastError(err?.response?.data?.message || 'Gán kênh vào nhóm thất bại!');
    }
  };

  // Thêm kênh logic
  const onFinish = (values: {
    channels: { link: string; isActive: boolean }[];
  }) => {
    const decodedChannels = values.channels.map((item) => ({
      ...item,
      link: item.link ? decodeURI(item.link) : '',
    }));

    // Sụ existing ObjectID-looking values as groupIds, others as new group names
    const existingGroupIds = selectedGroupIds.filter((v) =>
      /^[0-9a-fA-F]{24}$/.test(v),
    );
    const newGroupNames = selectedGroupIds.filter(
      (v) => !/^[0-9a-fA-F]{24}$/.test(v),
    );

    addChannelsMutation.mutate(
      {
        channels: decodedChannels,
        groupIds: existingGroupIds,
        newGroupNames,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toastSuccess('Thêm kênh thành công!');
          } else {
            toastError(res.message || 'Thêm kênh thất bại!');
          }
        },
        onError: (err: any) => {
          toastError(err?.response?.data?.message || 'Thêm kênh thất bại!');
        },
        onSettled: () => {
          form.resetFields();
          setCurrentPage(1);
          setSelectedGroupIds([]);
          invalidateChannels();
          setOpen(false);
        },
      },
    );
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) {
        setExcelLoading(false);
        return;
      }
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const allCells: string[] = json.flat().filter((cell) => !!cell);
      const channels = allCells.reduce(
        (acc: { link: string; isActive: boolean }[], cell) => {
          const link = decodeURI(cell);
          if (
            link.startsWith('https://www.youtube.com/') ||
            link.startsWith('https://youtube.com/')
          ) {
            acc.push({ link, isActive: true });
          }
          return acc;
        },
        [],
      );
      form.setFieldsValue({ channels });
      setExcelLoading(false);
      setChannelCount(channels.length);
    };
    reader.readAsBinaryString(file);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (
      newSelectedRowKeys: React.Key[],
      newSelectedRows: ChannelListItem[],
    ) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
    },
    preserveSelectedRowKeys: true,
  };

  const { addFavoriteMutation, removeFavoriteMutation } = useUserService();
  const profileStore = useUserStore((s) => s.profile);
  const favoriteIds: string[] = profileStore?.favoriteChannelIds || [];

  const exportMutation = useMutationExportChannels();
  const handleExportExcel = React.useCallback(() => {
    exportMutation.mutate(undefined, {
      onSuccess: (res) => {
        const rows = res?.result || [];
        const worksheet = XLSX.utils.json_to_sheet(
          rows.map((r: any) => ({
            Channel: `https://www.youtube.com/${r.channelId}`,
          })),
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Channels');
        XLSX.writeFile(workbook, `channels_${Date.now()}.xlsx`);
        toastSuccess('Đã xuất Excel thành công!');
      },
      onError: () => toastError('Xuất Excel thất bại!'),
    });
  }, [exportMutation]);

  const columns = [
    {
      title: 'Kênh Youtube',
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
                toastSuccess('Đã copy link!');
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
            <Tag
              color='default'
              className='border-none bg-gray-100 text-gray-400'>
              Trống
            </Tag>
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
          <span>Ngày đăng</span>
        </div>
      ),
      dataIndex: 'lastVideoAt',
      key: 'lastVideoAt',
      width: 170,
      render: (lastVideoAt: string) => {
        if (!lastVideoAt) {
          return (
            <Tooltip
              title={TOOLTIP_MESSAGES.ADD_TELEGRAM_GROUP}
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
      title: (
        <div className='flex items-center gap-2'>
          <FolderOutlined className='text-amber-500' />
          <span>Thuộc nhóm</span>
        </div>
      ),
      key: 'groups',
      width: 160,
      render: (_: any, record: ChannelListItem) => {
        if (!record.groups || record.groups.length === 0) {
          return <GroupCellPlaceholder record={record} />;
        }
        return (
          <div className='flex flex-wrap gap-1'>
            {record.groups.map((g) => (
              <span key={g._id} className='inline-flex items-center mb-0.5'>
                <Tooltip title={`Mở nhóm ${g.name}`} placement='top'>
                  <Tag
                    color='blue'
                    onClick={() => router.push(`/groups/${g._id}`)}
                    className='mr-0 text-xs max-w-[120px] truncate cursor-pointer hover:opacity-80 transition-opacity rounded-r-none border-r-0'>
                    {g.name}
                  </Tag>
                </Tooltip>
                <Popconfirm
                  title='Gỡ kênh khỏi nhóm?'
                  description={`Gỡ kênh khỏi nhóm “${g.name}”?`}
                  okText='Gỡ'
                  cancelText='Huỷ'
                  okButtonProps={{ danger: true, size: 'small' }}
                  onConfirm={() => {
                    removeGroupFromChannelMutation.mutate(
                      { channelDbId: record._id, groupId: g._id },
                      {
                        onSuccess: () => {
                          toastSuccess('Đã gỡ kênh khỏi nhóm!');
                          invalidateChannels();
                        },
                        onError: (err: any) =>
                          toastError(
                            err?.response?.data?.message || 'Gỡ kênh thất bại!',
                          ),
                      },
                    );
                  }}>
                  <span className='inline-flex items-center justify-center px-1 h-[22px] bg-blue-50 border border-blue-200 border-l-0 rounded-r-sm cursor-pointer text-blue-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors'>
                    <CloseOutlined style={{ fontSize: 9 }} />
                  </span>
                </Popconfirm>
              </span>
            ))}
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
      title: '',
      key: 'action',
      align: 'center' as const,
      width: 120,
      render: (_: any, record: ChannelListItem) => {
        const isFav = favoriteIds.includes(record._id);
        const isLoading =
          addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

        return (
          <div className='flex items-center gap-1 justify-center'>
            <Tooltip title='Yêu thích' placement='top' mouseEnterDelay={0.3}>
              <Button
                type='text'
                className='h-8 w-8 flex items-center justify-center'
                onClick={() => {
                  if (isFav) {
                    removeFavoriteMutation.mutate(record._id);
                  } else {
                    addFavoriteMutation.mutate(record._id);
                  }
                }}
                loading={isLoading}
                icon={
                  isFav ? (
                    <StarFilled className='text-yellow-300' />
                  ) : (
                    <StarOutlined className='text-gray-400' />
                  )
                }
              />
            </Tooltip>
            <Tooltip
              title='Thêm vào nhóm'
              placement='top'
              mouseEnterDelay={0.3}>
              <Button
                type='text'
                className='h-8 w-8 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-50'
                icon={<FolderAddOutlined />}
                onClick={() =>
                  setAssignGroupModal({
                    open: true,
                    channel: record,
                    selectedGroupIds: [],
                  })
                }
              />
            </Tooltip>
            <Popconfirm
              title='Xóa kênh?'
              description='Bạn có chắc muốn xóa kênh YouTube này không?'
              okText='Xóa'
              cancelText='Huỷ'
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record._id)}>
              <Button
                danger
                type='text'
                icon={<DeleteOutlined />}
                className='h-8 w-8 flex items-center justify-center'
                loading={
                  deleteChannelMutation.isPending &&
                  deleteChannelMutation.variables === record._id
                }
              />
            </Popconfirm>
          </div>
        );
      },
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

  return (
    <div className='max-w-6xl mx-auto mt-10 bg-white px-6 pt-4 rounded-lg shadow-lg'>
      <div className='flex flex-col gap-4 mb-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-center mb-0 text-xl font-semibold text-gray-800 flex items-center gap-3'>
            <div className='bg-blue-600 h-6 w-1 rounded-full'></div>
            Quản lý kênh Youtube
            <Tag
              color='blue'
              className='ml-1 font-semibold bg-blue-50 border-blue-100 text-blue-600 rounded px-1.5 text-[11px] h-5 flex items-center'>
              {total} kênh
            </Tag>
          </h2>
          <div className='flex gap-3 items-center'>
            <div className='flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm'>
              <FilterOutlined className='text-gray-400' />
              <span className='text-xs font-semibold text-gray-500 uppercase tracking-tight'>
                Sắp xếp:
              </span>
              <Select
                value={sort}
                onChange={(val) => {
                  setSort(val as ChannelSortKey);
                  setCurrentPage(1);
                }}
                variant='borderless'
                options={[
                  {
                    label: 'Vừa đăng video',
                    value: ChannelSortKey.NEWEST_UPLOAD,
                  },
                  {
                    label: 'Lâu đăng video',
                    value: ChannelSortKey.OLDEST_UPLOAD,
                  },
                  {
                    label: 'Chưa có nhóm',
                    value: ChannelSortKey.NO_GROUP,
                  },
                ]}
                className='min-w-40 font-semibold text-gray-700'
                size='small'
                disabled={!hasAnyChannels}
              />
            </div>

            <Button
              onClick={handleExportExcel}
              loading={exportMutation.isPending}
              disabled={channelsQuery.isLoading || total === 0}
              icon={<DownloadOutlined />}
              className='h-9 hover:border-blue-500 hover:text-blue-500 font-normal transition-all text-sm'>
              Xuất Excel
            </Button>

            <Button
              danger
              onClick={() => {
                Modal.confirm({
                  title: (
                    <div className='flex items-center gap-2'>
                      <DeleteOutlined className='text-red-500' />
                      <span>Xoá toàn bộ kênh</span>
                    </div>
                  ),
                  content:
                    'Bạn có chắc chắn muốn xoá TẤT CẢ kênh của bạn? Hành động này không thể hoàn tác.',
                  okText: 'Xoá hết',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    try {
                      await deleteAllChannels();
                      toastSuccess('Đã xoá toàn bộ kênh của bạn!');
                      setSelectedRowKeys([]);
                      setSelectedRows([]);
                    } catch (e) {
                      toastError('Có lỗi xảy ra khi xoá toàn bộ kênh!');
                    }
                  },
                });
              }}
              disabled={data.length === 0 || channelsQuery.isLoading}
              className='h-9 flex items-center justify-center font-normal text-sm'>
              Xoá toàn bộ
            </Button>

            <Button
              type='primary'
              onClick={() => setOpen(true)}
              icon={<PlusOutlined />}
              className='h-9 px-4 font-normal bg-blue-600 hover:bg-blue-700 border-none shadow-md shadow-blue-100 hover:scale-[1.01] transition-all rounded-lg flex items-center justify-center text-sm'>
              Thêm kênh
            </Button>
          </div>
        </div>
        <div className='border-t border-gray-100 pt-4 flex justify-between items-center'>
          <div className='flex items-center gap-4'>
            <Input.Search
              placeholder='Tìm theo ID hoặc tên kênh...'
              allowClear
              value={search}
              enterButton={<SearchOutlined />}
              onChange={handleSearchChange}
              className='w-80 shadow-sm border-blue-50'
            />
            <Checkbox
              checked={showFavoritesOnly}
              onChange={(e) => {
                setShowFavoritesOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className='text-gray-500 font-medium'>
              Chỉ kênh yêu thích
            </Checkbox>
          </div>

          {selectedRowKeys.length > 0 && (
            <div className='flex items-center gap-3 animate-fadeIn'>
              <span className='text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded border'>
                Đã chọn {selectedRowKeys.length}
              </span>
              <Button
                danger
                type='primary'
                icon={<DeleteOutlined />}
                onClick={handleDeleteMultiple}
                loading={deleteChannelMutation.isPending}
                className='h-9 font-normal shadow-md shadow-red-100 text-sm'>
                Xóa mục đã chọn
              </Button>
            </div>
          )}
        </div>
      </div>
      <Table
        rowSelection={hasAnyChannels ? rowSelection : undefined}
        columns={columns}
        dataSource={data.map((item) => ({ ...item, key: item._id }))}
        loading={channelsQuery.isLoading}
        pagination={pagination}
        bordered
        rowKey='_id'
        scroll={{ y: 'calc(100vh - 350px)' }}
      />
      <Modal
        open={open}
        onCancel={() => {
          form.setFieldsValue({
            channels: [{ link: '', isActive: true }],
          });
          setChannelCount(1);
          setExcelLoading(false);
          setSelectedGroupIds([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setOpen(false);
        }}
        title={
          <div className='flex items-center gap-2 py-0.5'>
            <PlusOutlined className='text-blue-500 text-base' />
            <span className='font-semibold text-gray-800 text-base uppercase tracking-tight'>
              Thêm kênh Youtube mới
            </span>
          </div>
        }
        footer={
          <div className='p-3 border-t bg-gray-50 rounded-b-xl'>
            <Button
              type='primary'
              htmlType='submit'
              block
              size='middle'
              loading={addChannelsMutation.isPending}
              disabled={addChannelsMutation.isPending}
              form='add_channel_form'
              className='h-11 text-sm font-normal shadow-md shadow-blue-100 hover:scale-[1.01] transition-all rounded-lg bg-blue-600 border-none'>
              Lưu danh sách kênh
            </Button>
          </div>
        }
        width={600}
        centered
        destroyOnClose
        className='premium-modal'
        styles={{
          content: { padding: 0 },
          body: { padding: 0 },
          header: {
            padding: '12px 20px',
            borderBottom: '1px solid #f0f0f0',
            margin: 0,
          },
          footer: { padding: 0, margin: 0 },
        }}>
        <div className='bg-slate-50 p-4 max-h-[60vh] overflow-y-auto custom-scrollbar-minimal'>
          <div className='flex justify-between items-center bg-white p-2.5 pl-3 rounded-xl border border-blue-50 shadow-sm mb-4'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-gray-700'>
                <span className='text-xl text-blue-500'>{channelCount}</span>{' '}
                kênh
              </span>
            </div>

            <div className='flex items-center gap-3'>
              <Button
                type='primary'
                size='small'
                loading={excelLoading}
                icon={<UploadOutlined />}
                disabled={excelLoading}
                onClick={handleUploadClick}
                className='h-8 px-3 font-normal bg-blue-500 hover:bg-blue-600 border-none shadow-sm shadow-blue-50 rounded-lg text-sm'>
                {excelLoading ? 'Đang xử lý...' : 'Tải từ Excel'}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type='file'
              accept='.xlsx,.xls'
              onChange={excelLoading ? undefined : handleExcelUpload}
              className='hidden'
              disabled={excelLoading}
            />
          </div>

          <Form
            form={form}
            name='add_channel_form'
            onFinish={onFinish}
            autoComplete='off'
            className='mt-4'>
            <Form.List
              name='channels'
              initialValue={[{ link: '', isActive: true }]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row
                      gutter={8}
                      key={key}
                      align='top'
                      className='mb-2 last:mb-0'>
                      <Col flex='auto'>
                        <Form.Item
                          {...restField}
                          name={[name, 'link']}
                          rules={[
                            {
                              required: true,
                              message: 'Vui lòng nhập link kênh!',
                            },
                          ]}
                          className='mb-0'>
                          <Input
                            placeholder='Link kênh Youtube'
                            className='h-10 text-sm rounded-lg border-gray-200'
                            onPaste={(e) => {
                              const clipboard = e.clipboardData.getData('text');
                              e.preventDefault();
                              const decoded = decodeURI(clipboard);
                              form.setFieldsValue({
                                channels: (
                                  form.getFieldValue('channels') as {
                                    link: string;
                                    isActive: boolean;
                                  }[]
                                ).map(
                                  (
                                    row: { link: string; isActive: boolean },
                                    idx: number,
                                  ) =>
                                    idx === name
                                      ? { ...row, link: decoded }
                                      : row,
                                ),
                              });
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col>
                        <Form.Item
                          {...restField}
                          name={[name, 'isActive']}
                          valuePropName='checked'
                          initialValue={true}
                          className='mb-0 pt-1'>
                          <Switch
                            checkedChildren='Bật'
                            unCheckedChildren='Tắt'
                          />
                        </Form.Item>
                      </Col>
                      <Col className='flex items-start pt-1.5'>
                        {fields.length > 1 && (
                          <Button
                            danger
                            type='text'
                            size='small'
                            icon={<DeleteOutlined className='text-xs' />}
                            onClick={() => {
                              remove(name);
                              setChannelCount(fields.length - 1);
                              setTimeout(scrollToBottom, 100);
                            }}
                            className='flex items-center justify-center h-7 w-7 rounded-lg hover:bg-red-50'
                            title='Xoá dòng này'
                          />
                        )}
                      </Col>
                    </Row>
                  ))}
                  <Form.Item className='mb-0 mt-3'>
                    <Button
                      type='dashed'
                      size='small'
                      onClick={() => {
                        add({ link: '', isActive: true });
                        setChannelCount(fields.length + 1);
                        setTimeout(scrollToBottom, 100);
                      }}
                      block
                      icon={<PlusOutlined />}
                      className='h-10 border-dashed border border-blue-200 text-blue-500 font-normal hover:border-blue-400 hover:text-blue-600 bg-white rounded-lg shadow-sm transition-all text-sm'>
                      Thêm dòng mới
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            {/* Group assignment section */}
            <div className='mt-2 p-3 bg-white rounded-xl border border-blue-100 shadow-sm'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <FolderOutlined className='text-blue-500' />
                  <span className='text-sm font-medium text-gray-700'>
                    Thêm vào nhóm
                  </span>
                  <span className='text-[10px] text-slate-400 font-semibold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200'>
                    Tuỳ chọn
                  </span>
                </div>
                {selectedGroupIds.length > 0 && (
                  <Button
                    type='text'
                    size='small'
                    danger
                    className='text-sm h-6 px-2 hover:bg-red-50 font-normal'
                    onClick={() => setSelectedGroupIds([])}>
                    Xoá tất cả
                  </Button>
                )}
              </div>

              <Select
                mode='tags'
                className='w-full'
                placeholder='Chọn nhóm hoặc gõ tên nhóm mới...'
                value={selectedGroupIds}
                onChange={setSelectedGroupIds}
                showSearch
                size='middle'
                tokenSeparators={[',']}
                filterOption={(input, opt) =>
                  (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={groups.map((g: any) => ({
                  value: g._id,
                  label: g.name,
                }))}
                notFoundContent={null}
                style={{ borderRadius: '8px' }}
              />

              <div className='flex items-start gap-2 mt-3 p-3 bg-blue-50/40 rounded-lg border border-blue-100/50'>
                <InfoCircleOutlined className='text-blue-400 mt-0.5 shrink-0 text-sm' />
                <div className='text-[11.5px] text-blue-700/70 leading-relaxed font-medium'>
                  Chọn nhóm có sẵn từ danh sách hoặc gõ tên nhóm mới rồi nhấn{' '}
                  <kbd className='px-1.5 py-0.5 bg-white border border-blue-200 rounded-md shadow-sm text-blue-700 font-semibold mx-0.5'>
                    Enter
                  </kbd>{' '}
                  (hoặc dấu phẩy) để tạo và thêm kênh vào nhóm ngay lập tức.
                </div>
              </div>
            </div>
          </Form>
        </div>
      </Modal>

      {/* Assign to Group Modal */}
      <Modal
        open={assignGroupModal.open}
        onCancel={() =>
          setAssignGroupModal({
            open: false,
            channel: null,
            selectedGroupIds: [],
          })
        }
        title={
          <div className='flex items-center gap-2'>
            <FolderAddOutlined className='text-blue-500' />
            <span className='font-medium text-gray-800 text-[15px]'>
              Thêm kênh vào nhóm
            </span>
          </div>
        }
        footer={
          <div className='p-3 border-t bg-gray-50 rounded-b-xl flex gap-3'>
            <Button
              className='flex-1 h-11 rounded-lg text-sm'
              onClick={() =>
                setAssignGroupModal({
                  open: false,
                  channel: null,
                  selectedGroupIds: [],
                })
              }>
              Hủy
            </Button>
            <Button
              type='primary'
              className='flex-1 h-11 rounded-lg font-semibold bg-blue-600 border-none text-sm'
              loading={
                addGroupToChannelMutation.isPending ||
                createGroupMutation.isPending
              }
              disabled={assignGroupModal.selectedGroupIds.length === 0}
              onClick={() => {
                if (assignGroupModal.selectedGroupIds.length > 0) {
                  handleAssignGroup(assignGroupModal.selectedGroupIds);
                }
              }}>
              Xác nhận thêm
            </Button>
          </div>
        }
        centered
        width={460}
        destroyOnClose
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
        {assignGroupModal.channel && (
          <div className='flex flex-col gap-6'>
            {/* Header: Channel Info - Aligned left, no icon background */}
            <div className='bg-slate-100 px-3 py-2 rounded-lg border border-blue-100/50 flex items-center gap-3'>
              <YoutubeOutlined className='text-red-500 text-xl flex-shrink-0' />
              <span className='text-[15px] font-semibold text-gray-700 truncate min-w-0'>
                https://www.youtube.com/{assignGroupModal.channel.channelId}
              </span>
            </div>

            {/* Current groups */}
            <div className='flex flex-col gap-3'>
              <span className='font-semibold text-gray-800 px-1'>
                Nhóm hiện tại
              </span>
              <div className='flex flex-wrap gap-2 px-1'>
                {(assignGroupModal.channel.groups || []).length > 0 ? (
                  (assignGroupModal.channel.groups || []).map((g: any) => (
                    <span
                      key={g._id}
                      className='inline-flex items-center mb-0.5'>
                      <Tooltip title={`Mở nhóm ${g.name}`} placement='top'>
                        <Tag
                          color='blue'
                          onClick={() => router.push(`/groups/${g._id}`)}
                          className='mr-0 text-xs max-w-[140px] truncate cursor-pointer hover:opacity-80 transition-opacity rounded-r-none border-r-0'>
                          {g.name}
                        </Tag>
                      </Tooltip>
                      <Popconfirm
                        title='Gỡ kênh khỏi nhóm?'
                        description={`Gỡ kênh khỏi nhóm “${g.name}”?`}
                        okText='Gỡ'
                        cancelText='Huỷ'
                        okButtonProps={{ danger: true, size: 'small' }}
                        onConfirm={() => {
                          removeGroupFromChannelMutation.mutate(
                            {
                              channelDbId: assignGroupModal.channel!._id,
                              groupId: g._id,
                            },
                            {
                              onSuccess: () => {
                                toastSuccess('Đã gỡ kênh khỏi nhóm!');
                                invalidateChannels();
                                setAssignGroupModal((prev) => ({
                                  ...prev,
                                  channel: prev.channel
                                    ? {
                                        ...prev.channel,
                                        groups: (
                                          prev.channel.groups || []
                                        ).filter((gr: any) => gr._id !== g._id),
                                      }
                                    : null,
                                }));
                              },
                              onError: (err: any) =>
                                toastError(
                                  err?.response?.data?.message ||
                                    'Gỡ kênh thất bại!',
                                ),
                            },
                          );
                        }}>
                        <span className='inline-flex items-center justify-center px-1 h-[22px] bg-blue-50 border border-blue-200 border-l-0 rounded-r-sm cursor-pointer text-blue-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors'>
                          <CloseOutlined style={{ fontSize: 9 }} />
                        </span>
                      </Popconfirm>
                    </span>
                  ))
                ) : (
                  <span className='text-sm text-gray-300 italic'>
                    Chưa thuộc bất kỳ nhóm nào
                  </span>
                )}
              </div>
            </div>

            {/* Add to group section */}
            <div className='flex flex-col gap-3'>
              <span className='font-semibold text-gray-800 px-1'>
                Thêm vào nhóm mới
              </span>
              <div className='px-1'>
                <Select
                  showSearch
                  mode='tags'
                  className='w-full'
                  placeholder='Chọn hoặc gõ tên nhóm mới...'
                  tokenSeparators={[',']}
                  filterOption={(input, opt) =>
                    (opt?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={groups
                    .filter(
                      (g: any) =>
                        !(assignGroupModal.channel?.groups || []).some(
                          (cg: any) => cg._id === g._id,
                        ),
                    )
                    .map((g: any) => ({ value: g._id, label: g.name }))}
                  value={assignGroupModal.selectedGroupIds}
                  onChange={(values) => {
                    setAssignGroupModal((prev) => ({
                      ...prev,
                      selectedGroupIds: values,
                    }));
                  }}
                  loading={
                    addGroupToChannelMutation.isPending ||
                    createGroupMutation.isPending
                  }
                  notFoundContent={
                    <div className='text-center py-4 text-gray-400'>
                      <span className='text-sm'>
                        Gõ tên nhóm mới rồi nhấn Enter
                      </span>
                    </div>
                  }
                  style={{ borderRadius: '12px' }}
                />
                <p className='mt-2 px-1 text-xs text-gray-400 leading-relaxed font-medium italic opacity-80'>
                  Gõ tên nhóm mới và nhấn{' '}
                  <strong className='text-gray-500'>Enter</strong> để hệ thống
                  tự động tạo nhóm mới cho bạn.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HomePage;
