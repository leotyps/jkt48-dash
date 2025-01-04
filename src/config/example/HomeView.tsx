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
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { config } from '@/config/common';
import { StyledChart } from '@/components/chart/StyledChart';
import { dashboard } from '@/config/translations/dashboard';
import Link from 'next/link';
import { FaRobot } from 'react-icons/fa';
import { MdVoiceChat } from 'react-icons/md';

export default function HomeView() {
  const t = dashboard.useTranslations();

  return (
    <Flex direction="column" gap={5}>
      {/* API Key Details */}
      <Flex direction="column" alignItems="start" rounded="2xl" bg="Brand" gap={4} p={5}>
        <Circle
          color="white"
          bgGradient="linear(to right bottom, transparent, blackAlpha.600)"
          p={4}
          shadow="2xl"
          display={{ base: 'none', md: 'block' }}
        >
          <Icon as={FaRobot} w="60px" h="60px" />
        </Circle>

        <ApiKeyDetails />
      </Flex>

      <Flex direction="column" gap={1} mt={3}>
        <Heading size="md">{t.servers.title}</Heading>
        <Text color="TextSecondary">{t.servers.description}</Text>
      </Flex>
      <GuildSelect />

      <Flex direction="column" gap={1}>
        <Heading size="md">{t.command.title}</Heading>
        <Text color="TextSecondary">{t.command.description}</Text>
      </Flex>
      <TestChart />
    </Flex>
  );
}

function ApiKeyDetails() {
  const [apiKey, setApiKey] = useState<string>('Loading...');
  const [expiryDate, setExpiryDate] = useState<string>('Loading...');
  const [remainingRequests, setRemainingRequests] = useState<number | string>('Loading...');
  const toast = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem('jkt48-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      checkApiKey(storedApiKey);
    } else {
      setApiKey('No API key found');
    }
  }, []);

  const checkApiKey = async (key: string) => {
    try {
      const response = await fetch(`https://api.jkt48connect.my.id/api/check-apikey/${key}`);
      const data = await response.json();

      if (data.success) {
        setExpiryDate(data.expiry_date || 'Unknown');
        setRemainingRequests(data.remaining_requests ?? 'Unlimited');
      } else {
        setExpiryDate('Invalid');
        setRemainingRequests('Invalid');
        toast({
          title: 'Invalid API Key',
          description: data.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      setExpiryDate('Error');
      setRemainingRequests('Error');
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat memeriksa API Key.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap={4} w="full">
      {/* Card Nama API Key */}
      <Card rounded="xl" variant="primary">
        <CardBody>
          <Text fontWeight="bold" fontSize="lg">
            API Key
          </Text>
          <Text mt={2} color="TextSecondary">
            {apiKey}
          </Text>
        </CardBody>
      </Card>

      {/* Card Expiry Date */}
      <Card rounded="xl" variant="primary">
        <CardBody>
          <Text fontWeight="bold" fontSize="lg">
            Expiry Date
          </Text>
          <Text mt={2} color="TextSecondary">
            {expiryDate}
          </Text>
        </CardBody>
      </Card>

      {/* Card Remaining Requests */}
      <Card rounded="xl" variant="primary">
        <CardBody>
          <Text fontWeight="bold" fontSize="lg">
            Remaining Requests
          </Text>
          <Text mt={2} color="TextSecondary">
            {remainingRequests}
          </Text>
        </CardBody>
      </Card>
    </Grid>
  );
}
