import { uniqueId } from 'lodash';

import {
  IconLayoutDashboard,
  IconCalendar,
  IconCheckbox,
  IconCurrencyDong,
  IconListCheck,
  IconHeartbeat,
  IconNotebook,
  IconBook,
  IconBook2,
  IconBible,
  IconSearch,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';

const Menuitems = [
  // ── Quản Lý ──────────────────────────────────────────────────────────────
  {
    navlabel: true,
    subheader: 'Quản Lý',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconLayoutDashboard,
    href: '/',
  },
  {
    id: uniqueId(),
    title: 'Lịch',
    icon: IconCalendar,
    href: '/apps/calendar',
  },
  {
    id: uniqueId(),
    title: 'Công việc',
    icon: IconCheckbox,
    href: '/apps/tasks',
  },
  {
    id: uniqueId(),
    title: 'Tài chính',
    icon: IconCurrencyDong,
    href: '/apps/finance',
  },
  {
    id: uniqueId(),
    title: 'Kế hoạch ngày',
    icon: IconListCheck,
    href: '/apps/planner',
  },

  // ── Sức Khỏe & Cá Nhân ───────────────────────────────────────────────────
  {
    navlabel: true,
    subheader: 'Sức Khỏe & Cá Nhân',
  },
  {
    id: uniqueId(),
    title: 'Sức khỏe',
    icon: IconHeartbeat,
    href: '/apps/health',
  },
  {
    id: uniqueId(),
    title: 'Nhật ký',
    icon: IconNotebook,
    href: '/apps/journal',
  },
  {
    id: uniqueId(),
    title: 'Tĩnh nguyện',
    icon: IconBook,
    href: '/apps/devotion',
  },
  {
    id: uniqueId(),
    title: 'Đọc Kinh Thánh',
    icon: IconBook,
    href: '/apps/bible',
  },
  {
    id: uniqueId(),
    title: 'Học Kinh Thánh',
    icon: IconSearch,
    href: '/apps/bible-study',
  },
  {
    id: uniqueId(),
    title: 'Học Thuộc Lòng',
    icon: IconBook,
    href: '/apps/memorize',
  },
  {
    id: uniqueId(),
    title: 'Đọc Sách',
    icon: IconBook2,
    href: '/apps/ebook',
  },

  // ── Xã Hội ───────────────────────────────────────────────────────────────
  {
    navlabel: true,
    subheader: 'Xã Hội',
  },
  {
    id: uniqueId(),
    title: 'Bạn bè',
    icon: IconUsers,
    href: '/apps/friends',
  },

  // ── Cài đặt ──────────────────────────────────────────────────────────────
  {
    navlabel: true,
    subheader: 'Cài đặt',
  },
  {
    id: uniqueId(),
    title: 'Cài đặt',
    icon: IconSettings,
    href: '/apps/settings',
  },
];

export default Menuitems;
