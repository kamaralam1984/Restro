'use client';

import StaffLayout from '@/components/staff/StaffLayout';

export default function StaffPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StaffLayout>{children}</StaffLayout>;
}
