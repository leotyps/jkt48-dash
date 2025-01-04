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
  Box,
} from '@chakra-ui/react';
import Link from 'next/link';
import { BsDownload } from 'react-icons/bs';
import { FaMusic, FaRobot } from 'react-icons/fa';
import { MdVoiceChat } from 'react-icons/md';

export default function HomeView() {
  return (
    <Flex direction="column" gap={6} p={5}>
      {/* Header Section */}
      <Flex direction="column" align="start" gap={2}>
        <Heading fontSize="3xl" fontWeight="bold" color="Brand">
          API Categories
        </Heading>
        <Text color="TextSecondary">
          Explore different API categories and their features.
        </Text>
      </Flex>

      {/* Categories */}
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={5}>
        {/* Downloader Category */}
        <CategoryCard
          title="Downloader"
          description="Access various downloader APIs to retrieve media."
          icon={BsDownload}
          items={[
            { name: 'YouTube Downloader', link: '/api/downloader/youtube' },
            { name: 'TikTok Downloader', link: '/api/downloader/tiktok' },
            { name: 'Instagram Downloader', link: '/api/downloader/instagram' },
          ]}
        />

        {/* JKT48 Category */}
        <CategoryCard
          title="JKT48"
          description="APIs related to JKT48 content and utilities."
          icon={FaMusic}
          items={[
            { name: 'Showroom Data', link: '/api/jkt48/showroom' },
            { name: 'Theater Schedule', link: '/api/jkt48/theater' },
            { name: 'Member Details', link: '/api/jkt48/members' },
          ]}
        />
      </Grid>
    </Flex>
  );
}

function CategoryCard({ title, description, icon, items }) {
  return (
    <Card rounded="2xl" variant="outline" p={5}>
      <CardHeader as={HStack} gap={3}>
        <Circle size="50px" bg="Brand" color="white">
          <Icon as={icon} w={6} h={6} />
        </Circle>
        <Flex direction="column">
          <Heading fontSize="lg" fontWeight="bold">
            {title}
          </Heading>
          <Text color="TextSecondary">{description}</Text>
        </Flex>
      </CardHeader>
      <CardBody>
        <Flex direction="column" gap={3}>
          {items.map((item, index) => (
            <Button
              key={index}
              as={Link}
              href={item.link}
              variant="outline"
              justifyContent="start"
              leftIcon={<MdVoiceChat />}
            >
              {item.name}
            </Button>
          ))}
        </Flex>
      </CardBody>
    </Card>
  );
}
