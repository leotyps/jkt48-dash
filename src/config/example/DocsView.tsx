import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Circle,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { MdVoiceChat } from 'react-icons/md';
import { FaDownload, FaMusic } from 'react-icons/fa';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  items: { name: string; link: string }[];
}

function DocsView() {
  const categories = [
    {
      title: 'Downloader',
      description: 'Explore API endpoints for downloading various content.',
      icon: FaDownload,
      items: [
        { name: 'YouTube Downloader', link: '/docs/youtube-downloader' },
        { name: 'Instagram Downloader', link: '/docs/instagram-downloader' },
      ],
    },
    {
      title: 'JKT48',
      description: 'Access APIs related to JKT48 content.',
      icon: FaMusic,
      items: [
        { name: 'Member List', link: '/docs/member-list' },
        { name: 'Showroom Schedule', link: '/docs/showroom-schedule' },
      ],
    },
  ];

  return (
    <Flex direction="column" gap={6} p={6}>
      <Heading size="lg" fontWeight="bold">
        API Documentation
      </Heading>
      <Text color="TextSecondary">
        Browse through our API categories to learn how to use various endpoints.
      </Text>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            title={category.title}
            description={category.description}
            icon={category.icon}
            items={category.items}
          />
        ))}
      </Grid>
    </Flex>
  );
}

function CategoryCard({ title, description, icon, items }: CategoryCardProps) {
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

export default DocsView;
