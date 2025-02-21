import { Box, Heading, Text, Divider, VStack, HStack, Icon, Badge } from '@chakra-ui/react';
import { IoIosArrowForward } from 'react-icons/io';
import { FaCrown } from 'react-icons/fa';
const SwaggerUI = require('swagger-ui-react').default;
import 'swagger-ui-react/swagger-ui.css';

function DocsView() {
  const apiKey = localStorage.getItem('jkt48-api-key') || '';
  
  const features = [
    { name: 'Check API Key', url: '/api/check-apikey/{apiKey}', premium: false },
    { name: 'Get Theater Schedule JKT48', url: '/api/theater?api_key={apiKey}', premium: true },
    { name: 'Get Theater Detail JKT48', url: '/api/theater/2840?api_key={apiKey}', premium: true },
    { name: 'Get Events JKT48', url: '/api/events?api_key={apiKey}', premium: true },
    { name: 'Get Event Detail JKT48', url: '/api/events/{id}?api_key={apiKey}', premium: true },
    { name: 'Get Member Detail JKT48', url: '/api/members/{id}', premium: true },
    { name: 'Get All Members JKT48', url: '/api/members?api_key={apiKey}', premium: false },
    { name: 'Get Live Schedule JKT48', url: '/api/live?api_key={apiKey}', premium: true },
    { name: 'Get Recent Live JKT48', url: '/api/recent?api_key={apiKey}', premium: true },
    { name: 'Create Payment Qris ORKUT', url: '/api/create-payment?amount=xxx&qris=xxx&api_key{apiKey}', premium: false },
    { name: 'Check Payment Status ORKUT', url: '/api/check-payment-status?merchant=xxxx&keyorkut=xxxx&amount=xxxx&api_key={apiKey}', premium: false },
    { name: 'Get News JKT48', url: '/api/news?api_key={apiKey}', premium: true },
    { name: 'Get News Detail JKT48', url: '/api/news/{id}?api_key={apiKey}', premium: true },
    { name: 'Get Birthday Members JKT48', url: '/api/next-birthday?api_key={apiKey}', premium: false },
    { name: 'Download TikTok Video', url: '/api/downloader/tiktok?url=xxxx&api_key{apiKey}', premium: false },
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
      
      <VStack spacing={4} align="stretch">
        {features.map((feature, index) => {
          const urlWithApiKey = `https://api.jkt48connect.my.id${feature.url}`;
          return (
            <HStack
              key={index}
              p={4}
              borderRadius="xl"
              width="100%"
              justifyContent="space-between"
              alignItems="center"
              bg={feature.premium ? 'purple.100' : 'blue.100'}
              boxShadow="md"
              transition="all 0.3s ease-in-out"
              _hover={{ bg: feature.premium ? 'purple.200' : 'blue.200', transform: 'scale(1.05)' }}
            >
              <HStack>
                <Text fontWeight="medium">{feature.name}</Text>
                {feature.premium && (
                  <Badge colorScheme="purple" display="flex" alignItems="center">
                    <Icon as={FaCrown} w={3} h={3} mr={1} /> Premium
                  </Badge>
                )}
              </HStack>
              <Icon as={IoIosArrowForward} cursor="pointer" onClick={() => window.open(urlWithApiKey, '_blank')} />
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
}

export default DocsView;
