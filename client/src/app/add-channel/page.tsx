'use client';

import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Switch,
  Space,
  Row,
  Col,
  Divider,
  Typography,
  Card,
} from 'antd';
import {
  MinusCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useChannelService } from '../../hooks/useChannelService';
import { useTelegramService } from '../../hooks/useTelegramService';
import { toastSuccess, toastError } from '../../utils/toast';
import type { ChannelParam } from '../../types/channel';
import type { BaseResponse } from '../../types/common';
import type { FormListFieldData, FormListOperation } from 'antd/es/form';
import { useUserStore } from '../../store/userStore';
import * as XLSX from 'xlsx';

const { Title } = Typography;

const AddChannelPage = () => {
  const { addChannelsMutation } = useChannelService();
  const { updateGroupMutation } = useTelegramService();
  const [form] = Form.useForm();
  const [excelLoading, setExcelLoading] = useState(false);

  const onFinish = (values: { channels: ChannelParam[] }) => {
    const decodedChannels = values.channels.map((item) => ({
      ...item,
      link: item.link ? decodeURI(item.link) : '',
    }));
    addChannelsMutation.mutate(decodedChannels, {
      onSuccess: (res: BaseResponse<any>) => {
        if (res.success) {
          toastSuccess('Thêm kênh thành công!');
          form.resetFields();
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
      // Lấy tất cả các ô, flatten thành 1 mảng
      const allCells: string[] = json.flat().filter((cell) => !!cell);
      // Map thành mảng object cho form, chỉ lấy link youtube hợp lệ
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
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '40px auto',
        background: '#fff',
        padding: 32,
        borderRadius: 8,
        boxShadow: '0 2px 8px #f0f1f2',
      }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        Quản lý kênh & Telegram
      </Title>
      <Divider style={{ margin: '32px 0' }} />
      <div
        style={{
          background: '#fafcff',
          borderRadius: 8,
          boxShadow: '0 1px 4px #e5e7eb',
          padding: 24,
        }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
          <Title level={4} style={{ margin: 0 }}>
            Thêm kênh Youtube
          </Title>
          <Button
            type='primary'
            loading={excelLoading}
            icon={<UploadOutlined />}>
            <label
              htmlFor='excel-upload'
              style={{
                cursor: excelLoading ? 'not-allowed' : 'pointer',
                margin: 0,
              }}>
              {excelLoading ? 'Đang xử lý...' : 'Upload Excel'}
              <input
                id='excel-upload'
                type='file'
                accept='.xlsx,.xls'
                onChange={excelLoading ? undefined : handleExcelUpload}
                style={{ display: 'none' }}
                disabled={excelLoading}
              />
            </label>
          </Button>
        </div>
        <div
          className='font-bold text-lg'
          style={{ color: '#1677ff', fontWeight: 500 }}>
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
            {(
              fields: FormListFieldData[],
              { add, remove }: FormListOperation
            ) => (
              <>
                {fields.map(
                  ({ key, name, ...restField }: FormListFieldData) => (
                    <Row
                      gutter={16}
                      key={key}
                      align='middle'
                      style={{ marginBottom: 12 }}>
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
                            style={{ height: 40 }}
                            onPaste={(
                              e: React.ClipboardEvent<HTMLInputElement>
                            ) => {
                              const clipboard = e.clipboardData.getData('text');
                              e.preventDefault();
                              const decoded = decodeURI(clipboard);
                              form.setFieldsValue({
                                channels: form
                                  .getFieldValue('channels')
                                  .map((row: any, idx: number) =>
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
                            onClick={() => remove(name)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: 40,
                            }}
                            title='Xoá dòng này'
                          />
                        )}
                      </Col>
                    </Row>
                  )
                )}
                <Form.Item>
                  <Button
                    type='dashed'
                    onClick={() => add({ link: '', isActive: true })}
                    block
                    icon={<PlusOutlined />}
                    style={{ height: 40 }}>
                    Thêm kênh
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              block
              loading={addChannelsMutation.isPending}
              disabled={addChannelsMutation.isPending}
              style={{ height: 40 }}>
              Lưu danh sách kênh
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddChannelPage;
