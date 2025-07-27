'use client';

import { Nunito_Sans } from 'next/font/google';
import React from 'react';
import Providers from './providers';
import ProfileProvider from './profile-provider';
import { Layout, Menu, ConfigProvider } from 'antd';
import { HomeOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { LogoutOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import colors from '~/lib/tailwind/colors';
import { useUserStore } from '../store/userStore';
import { ROUTES } from '../constants';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
import Next13ProgressBar from 'next13-progressbar';

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
    icon: <PlusCircleOutlined />,
    label: 'Cập nhật Telegram',
  },
];

const theme = {};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);

  // Kiểm tra xem có phải trang auth không
  const isAuthPage =
    pathname === ROUTES.LOGIN.INDEX || pathname === ROUTES.REGISTER.INDEX;

  // Chỉ hiển thị sidebar khi đã đăng nhập và không phải trang auth
  const shouldShowSidebar = !isAuthPage && !!profile;

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push(ROUTES.LOGIN.INDEX);
  };

  // Render layout dựa trên loại trang
  const renderContent = () => {
    if (isAuthPage) {
      return <PublicRoute>{children}</PublicRoute>;
    } else {
      return <ProtectedRoute>{children}</ProtectedRoute>;
    }
  };

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
        <Next13ProgressBar
          color={colors.primary.DEFAULT}
          height='3px'
          showOnShallow={true}
          options={{ showSpinner: false }}
        />
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
                    <div className='flex flex-col h-full'>
                      <div className='h-16 flex items-center justify-center font-bold text-2xl tracking-wide text-blue-500'>
                        RoomBees
                      </div>
                      <Menu
                        mode='inline'
                        selectedKeys={[pathname]}
                        className='border-r-0 text-base flex-1'
                        items={menuItems}
                        onClick={({ key }) => router.push(key)}
                      />
                      <div className='p-4 border-t border-gray-100'>
                        <button
                          onClick={handleLogout}
                          className='w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors'>
                          <LogoutOutlined className='text-gray-400' />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </Sider>
                )}
                <Layout>
                  <Content
                    className={`min-h-screen ${shouldShowSidebar ? 'bg-gray-50' : 'bg-white'}`}>
                    <div className={shouldShowSidebar ? 'pb-8' : ''}>
                      {renderContent()}
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
