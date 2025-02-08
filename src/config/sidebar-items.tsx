import { Icon } from '@chakra-ui/react';
import { common } from '@/config/translations/common';
import { MdPerson, MdDashboard, MdBook } from 'react-icons/md'; // Tambahkan MdBook untuk ikon dokumentasi
import { FaKey } from 'react-icons/fa';
import { TbTheater } from "react-icons/tb";
import { SidebarItemInfo } from '@/utils/router';

const items: SidebarItemInfo[] = [
  {
    name: <common.T text="dashboard" />,
    path: '/user/home',
    icon: <Icon as={MdDashboard} />,
  },
  {
    name: <common.T text="profile" />,
    path: '/user/profile',
    icon: <Icon as={MdPerson} />,
  },
  {
    name: "Documentation", // Tambahkan item Documentation
    path: '/user/docs',
    icon: <Icon as={MdBook} />,
  },
  {
    name: "Create Apikey", // Tambahkan item Documentation
    path: '/user/create',
    icon: <Icon as={FaKey} />,
  },
  {
    name: "Deposit", // Tambahkan item Documentation
    path: '/payment/qris',
    icon: <Icon as={TbTheater} />,
  },
];

export default items;
