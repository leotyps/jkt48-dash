import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Tag,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { FaDownload, FaMusic } from 'react-icons/fa';

interface FeatureItem {
  name: string;
  link: string;
  parameters: { name: string; type: string }[];
  method: 'GET' | 'POST';
  status: 'active' | 'inactive';
}

interface Category {
  title: string;
  description: string;
  icon: React.ElementType;
  features: FeatureItem[];
}

function DocsView() {
  const categories: Category[] = [
    {
      title: 'Downloader',
      description: 'Explore API endpoints for downloading various content.',
      icon: FaDownload,
      features: [
        {
          name: 'YouTube Downloader',
          link: '/docs/youtube-downloader',
          parameters: [
            { name: 'url', type: 'string' },
            { name: 'apikey', type: 'string' },
          ],
          method: 'POST',
          status: 'active',
        },
        {
          name: 'Instagram Downloader',
          link: '/docs/instagram-downloader',
          parameters: [
            { name: 'url', type: 'string' },
            { name: 'apikey', type: 'string' },
          ],
          method: 'POST',
          status: 'inactive',
        },
      ],
    },
    {
      title: 'JKT48',
      description: 'Access APIs related to JKT48 content.',
      icon: FaMusic,
      features: [
        {
          name: 'Member List',
          link: '/docs/member-list',
          parameters: [{ name: 'apikey', type: 'string' }],
          method: 'GET',
          status: 'active',
        },
        {
          name: 'Showroom Schedule',
          link: '/docs/showroom-schedule',
          parameters: [{ name: 'apikey', type: 'string' }],
          method: 'GET',
          status: 'active',
        },
      ],
    },
  ];

  return (
    <Flex direction="column" gap={6} p={6}>
      <Heading size="lg" fontWeight="bold">
        API Documentation
      </Heading>
      <Text color="gray.600" mb={4}>
        Browse through our API categories to learn how to use various endpoints.
      </Text>
      {categories.map((category, index) => (
        <CategorySection key={index} {...category} />
      ))}
    </Flex>
  );
}

function CategorySection({ title, description, icon, features }: Category) {
  return (
    <Box as="section" mb={6}>
      <HStack mb={2} spacing={4} align="center">
        <Icon as={icon} w={6} h={6} color="blue.500" />
        <Heading size="md">{title}</Heading>
      </HStack>
      <Text fontSize="sm" color="gray.500" mb={4}>
        {description}
      </Text>
      <Flex direction="column" gap={3}>
        {features.map((feature, index) => (
          <FeatureDetail key={index} {...feature} />
        ))}
      </Flex>
    </Box>
  );
}

function FeatureDetail({ name, link, parameters, method, status }: FeatureItem) {
  return (
    <Flex
      align="center"
      borderWidth="1px"
      borderRadius="md"
      p={3}
      bg="white"
      _dark={{ bg: 'gray.800' }}
      shadow="sm"
      direction="row"
      justify="space-between"
      _hover={{ shadow: 'md' }}
    >
      <Flex direction="row" flex="1" align="center" gap={4}>
        <Box>
          <Link href={link}>
            <Heading size="sm" color="blue.500">
              {name}
            </Heading>
          </Link>
          <Text fontSize="xs" color="gray.500">
            {parameters
              .map((param) => `${param.name} (${param.type})`)
              .join(', ')}
          </Text>
        </Box>
      </Flex>
      <HStack spacing={3}>
        <Tag colorScheme={method === 'GET' ? 'blue' : 'green'}>{method}</Tag>
        <Tag
          colorScheme={status === 'active' ? 'teal' : 'red'}
          textTransform="capitalize"
        >
          {status}
        </Tag>
      </HStack>
    </Flex>
  );
}

export default DocsView;
