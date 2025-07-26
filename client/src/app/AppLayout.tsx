'use client';

import { Nunito_Sans } from 'next/font/google';
import React from 'react';
import Providers from './providers';
import ProfileProvider from './profile-provider';
import { Layout, Menu } from 'antd';
import { HomeOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';

const { Sider, Content } = Layout;

const font = Nunito_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: 'Trang chủ',
  },
  {
    key: '/add-channel',
    icon: <PlusCircleOutlined />,
    label: 'Thêm kênh',
  },
  {
    key: '/add-telegram',
    icon: <PlusCircleOutlined style={{ color: '#229ED9' }} />, // hoặc chọn icon khác nếu muốn
    label: 'Cập nhật Telegram',
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <html lang='en'>
      <head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, interactive-widget=resizes-visual'
        />
        <link rel='icon' href='/logo-yellow-on-brown.svg' sizes='any' />
      </head>
      <body className={font.className}>
        <Providers>
          <ProfileProvider>
            <Layout style={{ minHeight: '100vh' }}>
              <Sider
                width={220}
                style={{
                  background: '#fff',
                  boxShadow: '2px 0 8px #f0f1f2',
                  position: 'fixed',
                  left: 0,
                  top: 0,
                  height: '100vh',
                  zIndex: 100,
                }}>
                <div
                  style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 22,
                    letterSpacing: 1,
                    color: '#1677ff',
                  }}>
                  RoomBees
                </div>
                <Menu
                  mode='inline'
                  selectedKeys={[pathname]}
                  style={{ borderRight: 0, fontSize: 16 }}
                  items={menuItems}
                  onClick={({ key }) => router.push(key)}
                />
              </Sider>
              <Layout style={{ marginLeft: 220 }}>
                <Content style={{ minHeight: '100vh', background: '#f5f6fa' }}>
                  <div style={{ padding: '32px 0' }}>{children}</div>
                </Content>
              </Layout>
            </Layout>
          </ProfileProvider>
        </Providers>
      </body>
    </html>
  );
}
