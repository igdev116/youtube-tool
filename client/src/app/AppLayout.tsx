'use client';

import { Nunito_Sans } from 'next/font/google';
import React from 'react';
import Providers from './providers';
import ProfileProvider from './profile-provider';
import { Layout, Menu, ConfigProvider } from 'antd';
import { HomeOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import colors from '~/lib/tailwind/colors';
import { useUserStore } from '../store/userStore';

const { Sider, Content } = Layout;

const font = Nunito_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: 'Quản lý kênh',
  },
  {
    key: '/add-telegram',
    icon: <PlusCircleOutlined style={{ color: '#229ED9' }} />,
    label: 'Cập nhật Telegram',
  },
];

const theme = {};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);

  // Kiểm tra xem có phải trang auth không
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Chỉ hiển thị sidebar khi đã đăng nhập và không phải trang auth
  const shouldShowSidebar = !isAuthPage && !!profile;

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
            <ConfigProvider theme={theme}>
              <Layout className='min-h-screen'>
                {shouldShowSidebar && (
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
                )}
                <Layout>
                  <Content
                    className={`min-h-screen ${shouldShowSidebar ? 'bg-gray-50' : 'bg-white'}`}>
                    <div className={shouldShowSidebar ? 'pb-8' : ''}>
                      {children}
                    </div>
                  </Content>
                </Layout>
              </Layout>
            </ConfigProvider>
          </ProfileProvider>
        </Providers>
      </body>
    </html>
  );
}
