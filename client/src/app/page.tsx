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
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useChannelService } from '../hooks/useChannelService';
import type { ChannelListItem } from '../types/channel';
import { DeleteOutlined as DeleteOutlinedIcon } from '@ant-design/icons';
import { toastSuccess, toastError } from '../utils/toast';
import * as XLSX from 'xlsx';

const { Link } = Typography;

const HomePage = () => {
  const {
    useQueryGetListChannels,
    deleteChannelMutation,
    addChannelsMutation,
  } = useChannelService();
  const channelsQuery = useQueryGetListChannels({ limit: 20 });
  const data: ChannelListItem[] = channelsQuery.data?.result?.content || [];

  // Modal state
  const [open, setOpen] = React.useState(false);
  const [form] = Form.useForm();
  const [excelLoading, setExcelLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

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
      setTimeout(scrollToBottom, 100);
    };
    reader.readAsBinaryString(file);
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
    <div className='max-w-4xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-center mb-0 text-2xl font-bold'>
          Danh sách kênh Youtube
        </h2>
        <Button type='primary' onClick={() => setOpen(true)}>
          Thêm kênh
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data.map((item) => ({ ...item, key: item.channelId }))}
        loading={channelsQuery.isLoading}
        pagination={false}
        bordered
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
        destroyOnClose>
        <div
          ref={scrollRef}
          className='bg-blue-50 rounded-lg shadow-sm p-6 max-h-[70vh] overflow-y-auto'>
          <div className='flex justify-between items-center mb-4'>
            <span className='font-bold text-lg'>Thêm kênh Youtube</span>
            <Button
              type='primary'
              loading={excelLoading}
              icon={<UploadOutlined />}>
              <label
                htmlFor='excel-upload'
                className={`${excelLoading ? 'cursor-not-allowed' : 'cursor-pointer'} m-0`}>
                {excelLoading ? 'Đang xử lý...' : 'Upload Excel'}
                <input
                  id='excel-upload'
                  type='file'
                  accept='.xlsx,.xls'
                  onChange={excelLoading ? undefined : handleExcelUpload}
                  className='hidden'
                  disabled={excelLoading}
                />
              </label>
            </Button>
          </div>
          <div className='font-bold text-lg text-blue-500 mb-2'>
            Số lượng kênh: {form.getFieldValue('channels')?.length || 0}
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
