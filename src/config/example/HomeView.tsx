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
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { config } from '@/config/common';
import { StyledChart } from '@/components/chart/StyledChart';
import { dashboard } from '@/config/translations/dashboard';
import Link from 'next/link';
import { BsMusicNoteBeamed } from 'react-icons/bs';
import { IoOpen, IoPricetag } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import { MdVoiceChat } from 'react-icons/md';
import { GuildSelect } from '@/pages/user/home';

export default function HomeView() {
  const t = dashboard.useTranslations();

  useEffect(() => {
    // Fungsi untuk memutar audio
    const playAudio = async () => {
      try {
        const audio = new Audio('/ElevenLabs_2025-01-23T10_56_22_Kira_pvc_s50_sb100_se0_b_m2.mp3');
        audio.volume = 0.6; // Atur volume jika diperlukan
        await audio.play(); // Memulai pemutaran audio
      } catch (error) {
        console.error('Gagal memutar audio:', error);
      }
    };

    playAudio(); // Panggil fungsi untuk memutar audio
  }, []); // Hanya dipanggil sekali saat komponen di-mount

  return (
    <Flex direction="column" gap={5}>
      {/* Invite Section */}
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
            _hover={{
              bg: 'whiteAlpha.300',
            }}
            _active={{
              bg: 'whiteAlpha.400',
            }}
            leftIcon={<IoOpen />}
          >
            {t.invite.bn}
          </Button>
        </Flex>
      </Flex>

      {/* JKT48Connect Section */}
      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        gap={4}
      >
        <Flex direction="column" gap={3}>
          <Text fontSize="lg" fontWeight="600">
            JKT48Connect Section
          </Text>
          <VoiceChannelItem />
        </Flex>
      </Grid>

      {/* Servers Section */}
      <Flex direction="column" gap={1} mt={3}>
        <Heading size="md">{t.servers.title}</Heading>
        <Text color="TextSecondary">{t.servers.description}</Text>
      </Flex>
      <GuildSelect />

      {/* Commands Section */}
      <Flex direction="column" gap={1}>
        <Heading size="md">{t.command.title}</Heading>
        <Text color="TextSecondary">{t.command.description}</Text>
        <HStack mt={3}>
          <Button leftIcon={<IoPricetag />} variant="action">
            {t.pricing}
          </Button>
          <Button px={6} rounded="xl" variant="secondary">
            {t.learn_more}
          </Button>
        </HStack>
      </Flex>

      {/* Chart Section */}
      <TestChart />

      {/* Create a Voice Channel Section */}
      <Flex direction="column" gap={3} mt={5}>
        <Heading size="md">Create a Voice Channel</Heading>
        <Card rounded="3xl" variant="primary">
          <CardBody as={Center} p={4} flexDirection="column" gap={3}>
            <Circle p={4} bg="brandAlpha.100" color="brand.500" _dark={{ color: 'brand.200' }}>
              <Icon as={MdVoiceChat} w="80px" h="80px" />
            </Circle>
            <Text fontWeight="medium">Silakan buat voice channel baru untuk diskusi</Text>
          </CardBody>
        </Card>
      </Flex>
    </Flex>
  );
}
