import {
  Center,
  Circle,
  Flex,
  Grid,
  Heading,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Icon,
  useToast,
  Box,
  Input,
  IconButton,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { config } from '@/config/common';
import { StyledChart } from '@/components/chart/StyledChart';
import { dashboard } from '@/config/translations/dashboard';
import Link from 'next/link';
import { BsMusicNoteBeamed } from 'react-icons/bs';
import { IoOpen, IoPricetag } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import { MdVoiceChat, MdVisibility, MdVisibilityOff, MdAccountBalanceWallet } from 'react-icons/md';
import { GuildSelect } from '@/pages/user/home';
import { IoPlay, IoPause, IoPlaySkipForward, IoPlaySkipBack } from 'react-icons/io5';
import { useSelfUser } from '@/api/hooks'; 

export default function HomeView() {
  const user = useSelfUser();
  const t = dashboard.useTranslations();
  
type User = {
  id: string;
  username: string;
  // tambahkan properti lain yang Anda perlukan dari user
};
  
  
function initializeApiKeyAndSaveUserData(user: User) {
  if (typeof window !== 'undefined') {
    const existingKey = localStorage.getItem('jkt48-api-key');

    // Buat parameter query dari data user
    const userData = new URLSearchParams({
      id: user.id,
      username: user.username,
      balance: '0', // Misalnya saldo awal adalah 0
    });

    if (!existingKey) {
      fetch(`/api/auth/get-api-key?${userData.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.apiKey) {
            localStorage.setItem('jkt48-api-key', data.apiKey);
            console.log('API Key saved to localStorage:', data.apiKey);
          }
        })
        .catch((err) => console.error('Failed to fetch API key:', err));
    } else {
      console.log('API Key already exists in localStorage:', existingKey);
    }
  }
}

useEffect(() => {
  // Pastikan user sudah tersedia sebelum memanggil fungsi
  if (user) {
    initializeApiKeyAndSaveUserData(user);
  }
}, [user]);

  return (
    <Flex direction="column" gap={5}>
      {/* Invite Section - Discord Bot */}
<Flex direction="row" alignItems="center" rounded="2xl" bg="Brand" gap={4} p={5}>
  <Circle
    color="white"
    bgGradient="linear(to right bottom, transparent, blackAlpha.600)"
    p={4}
    shadow="2xl"
    display={{ base: 'none', md: 'block' }}
  >
    <Icon as={FaRobot} w="60px" h="60px" />
  </Circle>

  <Flex direction="column" align="start" gap={1}>
    <Heading color="white" fontSize="2xl" fontWeight="bold">
      {t.invite.title}
    </Heading>
    <Text color="whiteAlpha.800">{t.invite.description}</Text>
    <Button
      mt={3}
      as={Link}
      href={config.inviteUrl}
      color="white"
      bg="whiteAlpha.200"
      _hover={{ bg: 'whiteAlpha.300' }}
      _active={{ bg: 'whiteAlpha.400' }}
      leftIcon={<IoOpen />}
    >
      {t.invite.bn}
    </Button>
  </Flex>
</Flex>

{/* Invite Section - WhatsApp Bot */}
<Flex direction="row" alignItems="center" rounded="2xl" bg="green.500" gap={4} p={5}>
  <Circle
    color="white"
    bgGradient="linear(to right bottom, transparent, blackAlpha.600)"
    p={4}
    shadow="2xl"
    display={{ base: 'none', md: 'block' }}
  >
    <Icon as={MdVoiceChat} w="60px" h="60px" />
  </Circle>

  <Flex direction="column" align="start" gap={1}>
    <Heading color="white" fontSize="2xl" fontWeight="bold">
      WhatsApp Bot
    </Heading>
    <Text color="whiteAlpha.800">Gunakan versi WhatsApp dari bot untuk akses fitur langsung dari WA kamu!</Text>
    <Button
      mt={3}
      as={Link}
      href="https://wa.me/628xxxxxxxxx"
      color="white"
      bg="whiteAlpha.200"
      _hover={{ bg: 'whiteAlpha.300' }}
      _active={{ bg: 'whiteAlpha.400' }}
      leftIcon={<IoOpen />}
    >
      Invite WhatsApp Bot
    </Button>
  </Flex>
</Flex>

  );
}
