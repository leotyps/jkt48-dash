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
  Input,
  useToast,
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

  return (
    <Flex direction="column" gap={5}>
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

      <Flex direction="column" gap={1} mt={3}>
        <Heading size="md">{t.servers.title}</Heading>
        <Text color="TextSecondary">{t.servers.description}</Text>
      </Flex>
      <GuildSelect />

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
      <TestChart />
      <Grid templateColumns={{ base: '1fr', lg: '0.5fr 1fr' }} gap={3}>
        <Card rounded="3xl" variant="primary">
          <CardBody as={Center} p={4} flexDirection="column" gap={3}>
            <Circle p={4} bg="brandAlpha.100" color="brand.500" _dark={{ color: 'brand.200' }}>
              <Icon as={BsMusicNoteBeamed} w="80px" h="80px" />
            </Circle>
            <Text fontWeight="medium">{t.vc.create}</Text>
          </CardBody>
        </Card>
        <Flex direction="column" gap={3}>
          <Text fontSize="lg" fontWeight="600">
            {t.vc['created channels']}
          </Text>
          <VoiceChannelItem />
        </Flex>
      </Grid>
    </Flex>
  );
}

function TestChart() {
  const [seriesData, setSeriesData] = useState([
    {
      name: 'Paid',
      data: [50, 64, 48, 66, 49, 68],
    },
    {
      name: 'Free Usage',
      data: [30, 50, 13, 46, 26, 16],
    },
  ]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Create new data based on the last value in the series
      setSeriesData((prevData) => {
        const newPaidData = [...prevData[0].data];
        const newFreeUsageData = [...prevData[1].data];

        // Simulate random change
        newPaidData.push(newPaidData[newPaidData.length - 1] + Math.floor(Math.random() * 5));
        newFreeUsageData.push(newFreeUsageData[newFreeUsageData.length - 1] + Math.floor(Math.random() * 5));

        // Keep the data length to 6, remove the first item if it exceeds
        if (newPaidData.length > 6) newPaidData.shift();
        if (newFreeUsageData.length > 6) newFreeUsageData.shift();

        return [
          { name: 'Paid', data: newPaidData },
          { name: 'Free Usage', data: newFreeUsageData },
        ];
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(intervalId); // Cleanup the interval when the component unmounts
  }, []);

  return (
    <StyledChart
      options={{
        colors: ['#4318FF', '#39B8FF'],
        chart: {
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
            animateGradually: {
              enabled: true,
              delay: 150,
            },
          },
        },
        xaxis: {
          categories: ['SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB'],
        },
        legend: {
          position: 'right',
        },
        responsive: [
          {
            breakpoint: 650,
            options: {
              legend: {
                position: 'bottom',
              },
            },
          },
        ],
      }}
      series={seriesData}
      height="300"
      type="line"
    />
  );
}

function VoiceChannelItem() {
  const [apiKey, setApiKey] = useState('');
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const toast = useToast();

  const checkApiKey = async () => {
    if (!apiKey) {
      toast({
        title: 'Error',
        description: 'API Key tidak boleh kosong!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`https://api.jkt48connect.my.id/api/check-apikey/${apiKey}`);
      const data = await response.json();

      if (data.success) {
        setApiStatus(`API Key valid hingga: ${data.expiry_date}`);
      } else {
        setApiStatus('API Key tidak valid.');
      }
    } catch (error) {
      setApiStatus('Terjadi kesalahan saat memeriksa API Key.');
    }
  };

  return (
    <Card rounded="2xl" variant="primary">
      <CardHeader as={HStack}>
        <Icon as={MdVoiceChat} color="Brand" fontSize={{ base: '2xl', md: '3xl' }} />
        <Text>My Channel</Text>
      </CardHeader>
      <CardBody mt={3}>
        <Text color="TextSecondary">89 Members</Text>
        <Input
          mt={3}
          placeholder="Masukkan API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <Button mt={3} onClick={checkApiKey} colorScheme="blue">
          Cek API Key
        </Button>
        {apiStatus && <Text mt={3}>{apiStatus}</Text>}
      </CardBody>
    </Card>
  );
}
