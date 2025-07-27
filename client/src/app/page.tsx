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
} from 'antd';
import { useChannelService } from '../hooks/useChannelService';
import type { ChannelListItem } from '../types/channel';
import {
  DeleteOutlined,
  UploadOutlined,
  PlusOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { toastSuccess, toastError } from '../utils/toast';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';

const { Link } = Typography;

const HomePage = () => {
  const {
    useQueryGetListChannels,
    deleteChannelMutation,
    addChannelsMutation,
    toggleChannelMutation,
    invalidateChannels,
    deleteMultipleChannels,
  } = useChannelService();

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [keyword, setKeyword] = React.useState('');

  // Selected rows state
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = React.useState<ChannelListItem[]>([]);

  const channelsQuery = useQueryGetListChannels({
    page: currentPage,
    limit: pageSize,
    keyword: keyword || undefined,
  });
  const data: ChannelListItem[] = channelsQuery.data?.result?.content || [];
  const total = channelsQuery.data?.result?.paging?.total || 0;

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

  const handleToggleChannel = (channelId: string, currentStatus: boolean) => {
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
          form.resetFields();
          setOpen(false);
        } else {
          toastError(res.message || 'Thêm kênh thất bại!');
        }
      },
      onError: (err: any) => {
        toastError(err?.response?.data?.message || 'Thêm kênh thất bại!');
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
      setTimeout(scrollToBottom, 100);
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
      title: 'Ngày đăng',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (createdAt: string) => dayjs(createdAt).format('DD/MM/YY'),
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
          onChange={() => handleToggleChannel(record._id, isActive)}
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
      width: 60,
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

  return (
    <div className='max-w-6xl mx-auto mt-10 bg-white px-6 pt-4 rounded-lg shadow-lg'>
      <div className='flex flex-col gap-4 mb-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-center mb-0 text-2xl font-bold'>
            Danh sách kênh Youtube{' '}
            <span className='text-primary'>({total} kênh)</span>
          </h2>
          <div className='flex gap-2'>
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
          <Input.Search
            placeholder='Tìm kiếm kênh Youtube...'
            allowClear
            value={search}
            onChange={handleSearchChange}
            className='max-w-xs'
          />
        </div>
      </div>
      <Table
        rowSelection={rowSelection}
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
        onCancel={() => setOpen(false)}
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
            <span className='font-bold text-lg'>Thêm kênh Youtube</span>
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
          <div className='font-bold text-lg text-blue-500 mb-2'>
            Số lượng kênh: {channelCount}
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
                          ]}>
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
                          initialValue={true}>
                          <Switch
                            checkedChildren='Bật'
                            unCheckedChildren='Tắt'
                          />
                        </Form.Item>
                      </Col>
                      <Col>
                        {fields.length > 1 && (
                          <Button
                            danger
                            type='text'
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              remove(name);
                              setChannelCount(fields.length - 1);
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
