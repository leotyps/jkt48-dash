import { Box, Heading, Text, Divider, SimpleGrid, Icon, Badge } from '@chakra-ui/react';
import { IoIosArrowForward } from 'react-icons/io';
import { FaCrown } from 'react-icons/fa';
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
      
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
        {features.map((feature, index) => (
          <Box
            key={index}
            p={2}
            borderBottomWidth="1px"
            borderColor="gray.300"
            cursor="pointer"
            _hover={{ bg: 'gray.50' }}
            onClick={() => window.open(feature.url, '_blank')}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text fontWeight="medium">{feature.name}</Text>
            <Box display="flex" alignItems="center">
              {feature.premium && (
                <Badge colorScheme="purple" mr={2} display="flex" alignItems="center">
                  <Icon as={FaCrown} w={3} h={3} mr={1} /> Premium
                </Badge>
              )}
              <Icon as={IoIosArrowForward} />
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default DocsView;
