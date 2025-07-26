import type { Metadata, Viewport } from 'next';
import AppLayout from './AppLayout';

export const metadata: Metadata = {
  title: 'RoomBees',
  description: 'RoomBees',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
