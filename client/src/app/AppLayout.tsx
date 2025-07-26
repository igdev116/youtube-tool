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
    key: '/add-telegram',
    icon: <PlusCircleOutlined style={{ color: '#229ED9' }} />,
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
            <Layout className='min-h-screen'>
              <Sider
                width={220}
                className='bg-white shadow-lg'
                collapsible
                trigger={null}
                breakpoint='lg'
                collapsedWidth={0}>
                <div className='h-16 flex items-center justify-center font-bold text-2xl tracking-wide text-blue-500'>
                  RoomBees
                </div>
                <Menu
                  mode='inline'
                  selectedKeys={[pathname]}
                  className='border-r-0 text-base'
                  items={menuItems}
                  onClick={({ key }) => router.push(key)}
                />
              </Sider>
              <Layout>
                <Content className='min-h-screen bg-gray-50'>
                  <div className='pb-8'>{children}</div>
                </Content>
              </Layout>
            </Layout>
          </ProfileProvider>
        </Providers>
      </body>
    </html>
  );
}
