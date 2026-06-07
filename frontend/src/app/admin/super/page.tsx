import { redirect } from 'next/navigation';

export default function SuperAdminRoot() {
  redirect('/admin/super/restaurants');
}
