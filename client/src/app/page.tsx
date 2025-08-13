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
} from 'antd';
import { useChannelService } from '../hooks/useChannelService';
import type { ChannelListItem } from '../types/channel';
import { ChannelSortKey } from '../types/channel';
import { ChannelErrorType } from '../types/channel';
import {
  DeleteOutlined,
  UploadOutlined,
  PlusOutlined,
  CopyOutlined,
  LinkOutlined,
  StarOutlined,
  StarFilled,
} from '@ant-design/icons';
import { toastSuccess, toastError } from '../utils/toast';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import { TOOLTIP_MESSAGES } from '../constants';
import { useUserService } from '../hooks/useUserService';
import { useUserStore } from '../store/userStore';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Link } = Typography;

const HomePage = () => {
  const {
    useQueryGetListChannels,
    deleteChannelMutation,
    addChannelsMutation,
    toggleChannelMutation,
    invalidateChannels,
    deleteMultipleChannels,
    deleteAllChannels,
  } = useChannelService();

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [keyword, setKeyword] = React.useState('');
  const [sort, setSort] = React.useState<ChannelSortKey>(
    ChannelSortKey.NEWEST_UPLOAD
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
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
          err?.response?.data?.message || 'Cập nhật trạng thái kênh thất bại!'
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

  // Thêm kênh logic
  const onFinish = (values: {
    channels: { link: string; isActive: boolean }[];
  }) => {
    const decodedChannels = values.channels.map((item) => ({
      ...item,
      link: item.link ? decodeURI(item.link) : '',
    }));

    addChannelsMutation.mutate(decodedChannels, {
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
        // Reset về trang 1 và refetch data
        form.resetFields();
        setCurrentPage(1);
        invalidateChannels();
        setOpen(false);
      },
    });
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
        []
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
      newSelectedRows: ChannelListItem[]
    ) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
    },
    preserveSelectedRowKeys: true,
  };

  const { addFavoriteMutation, removeFavoriteMutation } = useUserService();
  const profileStore = useUserStore((s) => s.profile);
  const favoriteIds: string[] = profileStore?.favoriteChannelIds || [];

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
      title: 'Video mới nhất',
      dataIndex: 'lastVideoId',
      key: 'lastVideoId',
      width: 150,
      render: (lastVideoId: string, record: ChannelListItem) => {
        // Ưu tiên hiển thị lỗi link nếu có
        const hasLinkError = record.errors?.includes(
          ChannelErrorType.LINK_ERROR
        );
        if (hasLinkError) {
          return (
            <Tooltip
              title={TOOLTIP_MESSAGES.CHECK_LINK_ERROR}
              placement='top'
              mouseEnterDelay={0}
              mouseLeaveDelay={0}>
              <Tag color='error'>Link kênh lỗi</Tag>
            </Tooltip>
          );
        }

        if (!lastVideoId) {
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
      width: 150,
      render: (lastVideoAt: string, record: ChannelListItem) => {
        // Ưu tiên hiển thị lỗi link nếu có
        const hasLinkError = record.errors?.includes(
          ChannelErrorType.LINK_ERROR
        );
        if (hasLinkError) {
          return (
            <Tooltip
              title={TOOLTIP_MESSAGES.CHECK_LINK_ERROR}
              placement='top'
              mouseEnterDelay={0}
              mouseLeaveDelay={0}>
              <Tag color='error'>Link kênh lỗi</Tag>
            </Tooltip>
          );
        }

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
      title: 'Tình trạng link',
      dataIndex: 'errors',
      key: 'errors',
      width: 160,
      render: (errors: ChannelErrorType[]) => {
        if (!errors || errors.length === 0) {
          return <Tag color='success'>Link ổn định</Tag>;
        }
        // Kiểm tra có lỗi link không
        const hasLinkError = errors.includes(ChannelErrorType.LINK_ERROR);

        return (
          <div className='flex flex-wrap gap-1'>
            {errors.map((error, index) => (
              <Tooltip
                key={index}
                title={
                  hasLinkError ? TOOLTIP_MESSAGES.CHECK_LINK_ERROR : undefined
                }
                placement='top'
                mouseEnterDelay={0}
                mouseLeaveDelay={0}>
                <Tag color='error'>{mapErrorTypeToMessage(error)}</Tag>
              </Tooltip>
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
      render: (isActive: boolean, record: ChannelListItem) => {
        const hasErrors = record.errors && record.errors.length > 0;
        const switchComponent = (
          <Switch
            checked={isActive}
            onChange={() => handleToggleChannel(record._id)}
            disabled={hasErrors}
            loading={
              toggleChannelMutation.isPending &&
              toggleChannelMutation.variables === record._id
            }
          />
        );

        if (hasErrors) {
          return (
            <Tooltip
              title={TOOLTIP_MESSAGES.CHECK_LINK_ERROR}
              placement='top'
              mouseEnterDelay={0}
              mouseLeaveDelay={0}>
              {switchComponent}
            </Tooltip>
          );
        }

        return switchComponent;
      },
    },
    {
      title: '',
      key: 'action',
      align: 'center' as const,
      width: 100,
      render: (_: any, record: ChannelListItem) => {
        const isFav = favoriteIds.includes(record._id);
        const isLoading =
          addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

        return (
          <div className='flex items-center gap-2'>
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
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debounceSearch(e.target.value);
  };

  // Map error type thành message
  const mapErrorTypeToMessage = (errorType: ChannelErrorType): string => {
    switch (errorType) {
      case ChannelErrorType.LINK_ERROR:
        return 'Link kênh lỗi';
      case ChannelErrorType.NETWORK_ERROR:
        return 'Lỗi kết nối mạng';
      case ChannelErrorType.PARSE_ERROR:
        return 'Lỗi xử lý dữ liệu';
      case ChannelErrorType.RATE_LIMIT_ERROR:
        return 'Lỗi giới hạn tần suất';
      default:
        return 'Lỗi không xác định';
    }
  };

  return (
    <div className='max-w-6xl mx-auto mt-10 bg-white px-6 pt-4 rounded-lg shadow-lg'>
      <div className='flex flex-col gap-4 mb-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-center mb-0 text-2xl font-bold'>
            Danh sách kênh Youtube{' '}
            <span className='text-primary'>({total} kênh)</span>
          </h2>
          <div className='flex gap-2 items-center'>
            <div className='flex items-center gap-2'>
              <span className='text-sm'>Sắp xếp theo:</span>
              <Select
                value={sort}
                onChange={(val) => {
                  setSort(val as ChannelSortKey);
                  setCurrentPage(1);
                }}
                options={[
                  {
                    label: 'Kênh vừa đăng video',
                    value: ChannelSortKey.NEWEST_UPLOAD,
                  },
                  {
                    label: 'Kênh mới nhất',
                    value: ChannelSortKey.NEWEST_CHANNEL,
                  },
                  {
                    label: 'Kênh cũ nhất',
                    value: ChannelSortKey.OLDEST_CHANNEL,
                  },
                ]}
                className='min-w-48'
                size='middle'
                disabled={!hasAnyChannels}
              />
            </div>
            <Button
              danger
              onClick={() => {
                Modal.confirm({
                  title: 'Xoá toàn bộ kênh',
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
              disabled={data.length === 0 || channelsQuery.isLoading}>
              Xoá toàn bộ
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteMultiple}
                loading={deleteChannelMutation.isPending}>
                Xóa ({selectedRowKeys.length})
              </Button>
            )}
            <Button type='primary' onClick={() => setOpen(true)}>
              Thêm kênh
            </Button>
          </div>
        </div>
        <div>
          <div className='flex items-center gap-4'>
            <Input.Search
              placeholder='Tìm kiếm kênh Youtube...'
              allowClear
              value={search}
              onChange={handleSearchChange}
              className='max-w-xs'
              disabled={!hasAnyChannels}
            />
            <Checkbox
              checked={showFavoritesOnly}
              onChange={(e) => {
                setShowFavoritesOnly(e.target.checked);
                setCurrentPage(1);
              }}>
              Chỉ hiển thị kênh yêu thích
            </Checkbox>
          </div>
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
        scroll={{ y: 'calc(100vh - 320px)' }}
      />
      <Modal
        open={open}
        onCancel={() => {
          form.resetFields();
          setChannelCount(1);
          setExcelLoading(false);
          if (fileInputRef.current) {
            // Clear selected file
            // @ts-ignore
            fileInputRef.current.value = '';
          }
          setOpen(false);
        }}
        title='Thêm kênh Youtube'
        footer={
          <Button
            type='primary'
            htmlType='submit'
            block
            loading={addChannelsMutation.isPending}
            disabled={addChannelsMutation.isPending}
            className='h-10'
            onClick={() => form.submit()}>
            Lưu danh sách kênh
          </Button>
        }
        width={600}
        destroyOnHidden>
        <div
          ref={scrollRef}
          className='bg-blue-50 rounded-lg shadow-sm p-6 max-h-[70vh] overflow-y-auto'>
          <div className='flex justify-between items-center mb-4'>
            <div className='font-bold text-lg text-blue-500 mb-2'>
              Số lượng kênh: {channelCount}
            </div>
            <Button
              type='primary'
              loading={excelLoading}
              icon={<UploadOutlined />}
              disabled={excelLoading}
              onClick={handleUploadClick}>
              {excelLoading ? 'Đang xử lý...' : 'Upload Excel'}
            </Button>
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
                    <Row gutter={16} key={key} align='middle' className='mb-3'>
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
                            className='h-10'
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
                                    idx: number
                                  ) =>
                                    idx === name
                                      ? { ...row, link: decoded }
                                      : row
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
                          className='mb-0'>
                          <Switch
                            checkedChildren='Bật'
                            unCheckedChildren='Tắt'
                          />
                        </Form.Item>
                      </Col>
                      <Col className='flex items-center'>
                        {fields.length > 1 && (
                          <Button
                            danger
                            type='text'
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              remove(name);
                              setTimeout(scrollToBottom, 100);
                            }}
                            className='flex items-center justify-center h-10'
                            title='Xoá dòng này'
                          />
                        )}
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button
                      type='dashed'
                      onClick={() => {
                        add({ link: '', isActive: true });
                        setChannelCount(fields.length + 1);
                        setTimeout(scrollToBottom, 100);
                      }}
                      block
                      icon={<PlusOutlined />}
                      className='h-10'>
                      Thêm kênh
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;
