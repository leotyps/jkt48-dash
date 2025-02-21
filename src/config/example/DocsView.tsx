import { Box, Heading, Text, Divider, Flex, Icon, Tag, TagLabel } from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
const SwaggerUI = require('swagger-ui-react').default;
import 'swagger-ui-react/swagger-ui.css';

function DocsView() {
  const features = [
    { name: 'Check API Key', url: '/check-api-key', premium: false },
    { name: 'Get Theater Schedule', url: '/theater', premium: true },
    { name: 'Get Theater Detail', url: '/theater/{id}', premium: true },
    { name: 'Get Events', url: '/events', premium: true },
    { name: 'Get Event Detail', url: '/events/{id}', premium: true },
    { name: 'Get Member Detail', url: '/members/{id}', premium: true },
    { name: 'Get All Members', url: '/members', premium: false },
    { name: 'Get Live Schedule', url: '/live', premium: true },
    { name: 'Get Recent Live', url: '/recent-live', premium: true },
    { name: 'Create Payment', url: '/create-payment', premium: false },
    { name: 'Check Payment Status', url: '/check-payment-status', premium: false },
    { name: 'Get News', url: '/news', premium: true },
    { name: 'Get News Detail', url: '/news/{id}', premium: true },
    { name: 'Get Birthday Members', url: '/birthday-members', premium: false },
    { name: 'Download TikTok', url: '/downloader/tiktok', premium: false },
  ];

  return (
    <Box p={6}>
      <Heading size="lg" fontWeight="bold" mb={4} color="gray.800">
        JKT48Connect API Documentation
      </Heading>
      <Text color="gray.500" mb={6} fontSize="lg">
        Explore the API endpoints for JKT48 content and downloader services.
      </Text>
      <Divider my={4} />
      <Flex wrap="wrap" gap={4}>
        {features.map((feature, index) => (
          <Box
            key={index}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            width="200px"
            cursor="pointer"
            _hover={{ bg: 'gray.50' }}
            onClick={() => window.open(feature.url, '_blank')}
          >
            <Flex justify="space-between" align="center">
              <Text fontWeight="medium">{feature.name}</Text>
              <Icon as={ArrowForwardIcon} />
            </Flex>
            {feature.premium && (
              <Tag size="sm" colorScheme="purple" mt={2}>
                <TagLabel>Premium</TagLabel>
              </Tag>
            )}
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

export default DocsView;
