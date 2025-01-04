import { Box, Heading, Text, Code, Divider } from '@chakra-ui/react';

function DocsView() {
  const openApiSpec = `openapi: 3.0.0
servers:
  - description: JKT48Connect API Server
    url: https://api.jkt48connect.my.id/api
info:
  description: This is an API for JKT48 content and downloader services
  version: "1.0.0"
  title: JKT48Connect API
  contact:
    email: you@your-company.com
  license:
    name: Apache 2.0
    url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
tags:
  - name: downloader
    description: Operations for downloading content
  - name: jkt48
    description: Operations for accessing JKT48 content
paths:
  /downloader/tiktok:
    get:
      tags:
        - downloader
      summary: Downloads TikTok content
      operationId: downloadTikTok
      description: |
        Downloads TikTok video content by providing the video URL and API key.
      parameters:
        - in: query
          name: url
          description: TikTok video URL to download
          required: true
          schema:
            type: string
        - in: query
          name: api_key
          description: API key for authentication
          required: true
          schema:
            type: string
      responses:
        '200':
          description: TikTok video downloaded successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  videoUrl:
                    type: string
                    example: 'https://download.tiktok.com/video/abc123'
                  message:
                    type: string
                    example: 'Video download successful'
        '400':
          description: Bad request, missing or invalid parameters
        '401':
          description: Unauthorized, invalid API key
        '404':
          description: TikTok video not found
        '500':
          description: Internal server error

  /events:
    get:
      tags:
        - jkt48
      summary: Get JKT48 events
      operationId: getEvents
      description: Fetch the list of JKT48 events.
      parameters:
        - in: query
          name: api_key
          description: API key for authentication
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Events retrieved successfully
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    eventId:
                      type: string
                      example: 'event123'
                    eventName:
                      type: string
                      example: 'JKT48 Concert'
                    eventDate:
                      type: string
                      format: date-time
                      example: '2025-05-21T00:00:00Z'
        '400':
          description: Bad request, missing or invalid parameters
        '401':
          description: Unauthorized, invalid API key`;

  return (
    <Box p={6}>
      <Heading size="lg" fontWeight="bold" mb={4} color="gray.800">
        JKT48Connect API Documentation
      </Heading>
      <Text color="gray.500" mb={6} fontSize="lg">
        Explore the API endpoints for JKT48 content and downloader services.
      </Text>
      <Divider my={4} />
      <Box whiteSpace="pre-wrap" fontFamily="monospace" color="gray.700">
        <Code p={4} display="block" whiteSpace="pre-wrap">{openApiSpec}</Code>
      </Box>
    </Box>
  );
}

export default DocsView;
