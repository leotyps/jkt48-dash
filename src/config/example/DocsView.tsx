import { Box, Heading, Text, Divider } from '@chakra-ui/react';
const SwaggerUI = require('swagger-ui-react').default;
import 'swagger-ui-react/swagger-ui.css';

function DocsView() {
  const openApiSpec = {
    openapi: '3.0.0',
    servers: [
      {
        description: 'JKT48Connect API Server',
        url: 'https://api.jkt48connect.my.id/api',
      },
    ],
    info: {
      description: 'This is an API for JKT48 content and downloader services',
      version: '1.0.0',
      title: 'JKT48Connect API',
      contact: {
        email: 'you@your-company.com',
      },
      license: {
        name: 'Apache 2.0',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
      },
    },
    tags: [
      {
        name: 'downloader',
        description: 'Operations for downloading content',
      },
      {
        name: 'jkt48',
        description: 'Operations for accessing JKT48 content',
      },
    ],
    paths: {
      '/downloader/tiktok': {
        get: {
          tags: ['downloader'],
          summary: 'Downloads TikTok content',
          operationId: 'downloadTikTok',
          description: 'Downloads TikTok video content by providing the video URL and API key.',
          parameters: [
            {
              in: 'query',
              name: 'url',
              description: 'TikTok video URL to download',
              required: true,
              schema: {
                type: 'string',
              },
            },
            {
              in: 'query',
              name: 'api_key',
              description: 'API key for authentication',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'TikTok video downloaded successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                        example: true,
                      },
                      videoUrl: {
                        type: 'string',
                        example: 'https://download.tiktok.com/video/abc123',
                      },
                      message: {
                        type: 'string',
                        example: 'Video download successful',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request, missing or invalid parameters',
            },
            '401': {
              description: 'Unauthorized, invalid API key',
            },
            '404': {
              description: 'TikTok video not found',
            },
            '500': {
              description: 'Internal server error',
            },
          },
        },
      },
      '/events': {
        get: {
          tags: ['jkt48'],
          summary: 'Get JKT48 events',
          operationId: 'getEvents',
          description: 'Fetch the list of JKT48 events.',
          parameters: [
            {
              in: 'query',
              name: 'api_key',
              description: 'API key for authentication',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Events retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        eventId: {
                          type: 'string',
                          example: 'event123',
                        },
                        eventName: {
                          type: 'string',
                          example: 'JKT48 Concert',
                        },
                        eventDate: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-05-21T00:00:00Z',
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request, missing or invalid parameters',
            },
            '401': {
              description: 'Unauthorized, invalid API key',
            },
          },
        },
      },
      '/live': {
        get: {
          tags: ['jkt48'],
          summary: 'Get JKT48 live schedule',
          operationId: 'getLiveSchedule',
          description: 'Fetch the live schedule for JKT48 members.',
          parameters: [
            {
              in: 'query',
              name: 'api_key',
              description: 'API key for authentication',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Live schedule retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        liveId: {
                          type: 'string',
                          example: 'live123',
                        },
                        liveTitle: {
                          type: 'string',
                          example: 'JKT48 Live Show',
                        },
                        liveDate: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-05-15T00:00:00Z',
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request, missing or invalid parameters',
            },
            '401': {
              description: 'Unauthorized, invalid API key',
            },
          },
        },
      },
      '/theater': {
        get: {
          tags: ['jkt48'],
          summary: 'Get JKT48 theater schedule',
          operationId: 'getTheaterSchedule',
          description: 'Fetch the theater schedule for JKT48 members.',
          parameters: [
            {
              in: 'query',
              name: 'api_key',
              description: 'API key for authentication',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Theater schedule retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        theaterId: {
                          type: 'string',
                          example: 'theater123',
                        },
                        theaterTitle: {
                          type: 'string',
                          example: 'JKT48 Theater Performance',
                        },
                        theaterDate: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-06-01T00:00:00Z',
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request, missing or invalid parameters',
            },
            '401': {
              description: 'Unauthorized, invalid API key',
            },
          },
        },
      },
      '/news': {
        get: {
          tags: ['jkt48'],
          summary: 'Get JKT48 news',
          operationId: 'getNews',
          description: 'Fetch the latest news about JKT48.',
          parameters: [
            {
              in: 'query',
              name: 'api_key',
              description: 'API key for authentication',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'News retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        newsId: {
                          type: 'string',
                          example: 'news123',
                        },
                        newsTitle: {
                          type: 'string',
                          example: 'JKT48 New Single Release',
                        },
                        newsDate: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-05-10T00:00:00Z',
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request, missing or invalid parameters',
            },
            '401': {
              description: 'Unauthorized, invalid API key',
            },
          },
        },
      },
      '/recent': {
        get: {
          tags: ['jkt48'],
          summary: 'Get recent JKT48 updates',
          operationId: 'getRecentUpdates',
          description: 'Fetch the most recent updates from JKT48.',
          parameters: [
            {
              in: 'query',
              name: 'api_key',
              description: 'API key for authentication',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Recent updates retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      updateId: {
                        type: 'string',
                        example: 'update123',
                      },
                      updateContent: {
                        type: 'string',
                        example: 'JKT48 member wins award',
                      },
                      updateDate: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-06-10T00:00:00Z',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request, missing or invalid parameters',
            },
            '401': {
              description: 'Unauthorized, invalid API key',
            },
          },
        },
      },
      '/next-birthday': {
        get: {
          tags: ['jkt48'],
          summary: 'Get next JKT48 member birthday',
          operationId: 'getNextBirthday',
          description: 'Fetch the next birthday of a JKT48 member.',
          parameters: [
            {
              in: 'query',
              name: 'api_key',
              description: 'API key for authentication',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Next birthday retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      memberName: {
                        type: 'string',
                        example: 'Zee JKT48',
                      },
                      birthdayDate: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-05-16T00:00:00Z',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request, missing or invalid parameters',
            },
            '401': {
              description: 'Unauthorized, invalid API key',
            },
          },
        },
      },
      '/theater/{id}': {
        get: {
          tags: ['jkt48'],
          summary: 'Get theater details for JKT48 by ID',
          operationId: 'getTheaterById',
          description: 'Fetch theater details by JKT48 theater ID.',
          parameters: [
            {
              in: 'path',
              name: 'id',
              description: 'ID of the theater',
              required: true,
              schema: {
                type: 'string',
              },
            },
            {
              in: 'query',
              name: 'api_key',
              description: 'API key for authentication',
              required: true,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Theater details retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      theaterId: {
                        type: 'string',
                        example: 'theater123',
                      },
                      theaterTitle: {
                        type: 'string',
                        example: 'JKT48 Theater Performance',
                      },
                      theaterDate: {
                        type: 'string',
                        format: 'date-time',
                        example: '2025-06-01T00:00:00Z',
                      },
                      theaterLocation: {
                        type: 'string',
                        example: 'Jakarta, Indonesia',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request, missing or invalid parameters',
            },
            '401': {
              description: 'Unauthorized, invalid API key',
            },
            '404': {
              description: 'Theater not found',
            },
          },
        },
      },
    },
  };

  return (
    <Box p={6}>
      <Heading size="lg" fontWeight="bold" mb={4} color="gray.800">
        JKT48Connect API Documentation
      </Heading>
      <Text color="gray.500" mb={6} fontSize="lg">
        Explore the API endpoints for JKT48 content and downloader services.
      </Text>
      <Divider my={4} />
      <Box height="600px">
        <SwaggerUI spec={openApiSpec} />
      </Box>
    </Box>
  );
}

export default DocsView;
