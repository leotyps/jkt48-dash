import {
  Heading,
  Button,
  Card,
  CardHeader,
  Avatar,
  Flex,
  SimpleGrid,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { config } from '@/config/common';
import { useGuilds } from '@/api/hooks';
import HomeView from '@/config/example/HomeView';
import { NextPageWithLayout } from '@/pages/_app';
import AppLayout from '@/components/layout/app';
import { iconUrl } from '@/api/discord';
import Link from 'next/link';
import Head from 'next/head'; // Import Head untuk menambahkan script ke <head>

const HomePage: NextPageWithLayout = () => {
  //used for example only, you should remove it
  return <HomeView />;

  return <GuildSelect />;
};

function initializeApiKeyInClient() {
  if (typeof window !== 'undefined') {
    const existingKey = localStorage.getItem('jkt48-api-key');

    if (!existingKey) {
      fetch('/api/auth/get-api-key')
        .then((res) => res.json())
        .then((data) => {
          if (data.apiKey) {
            localStorage.setItem('jkt48-api-key', data.apiKey);
            console.log('API Key saved to localStorage:', data.apiKey);
          }
        })
        .catch((err) => console.error('Failed to fetch API key:', err));
    } else {
      console.log('API Key already exists in localStorage:', existingKey);
    }
  }
};

useEffect(() => {
    initializeApiKeyInClient();
  }, []);

export function GuildSelect() {
  const guilds = useGuilds();

  if (guilds.status === 'success')
    return (
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={3}>
        {guilds.data
          ?.filter((guild) => config.guild.filter(guild))
          .map((guild) => (
            <Card key={guild.id} variant="primary">
              <CardHeader as={Flex} flexDirection="row" gap={3}>
                <Avatar src={iconUrl(guild)} name={guild.name} size="md" />
                <Text>{guild.name}</Text>
              </CardHeader>
              {/* Ganti Link dengan Button untuk invite bot ke server */}
              <Button
                as="a"
                href={`${config.inviteUrl}&guild_id=${guild.id}`} // Sesuaikan URL invite bot
                target="_blank"
                w="full"
                variant="action"
              >
                Invite Bot to {guild.name}
              </Button>
            </Card>
          ))}
      </SimpleGrid>
    );

  if (guilds.status === 'error')
    return (
      <Button w="fit-content" variant="danger" onClick={() => guilds.refetch()}>
        Try Again
      </Button>
    );

  if (guilds.status === 'loading')
    return (
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={3}>
        <Skeleton minH="88px" rounded="2xl" />
        <Skeleton minH="88px" rounded="2xl" />
        <Skeleton minH="88px" rounded="2xl" />
        <Skeleton minH="88px" rounded="2xl" />
        <Skeleton minH="88px" rounded="2xl" />
      </SimpleGrid>
    );

  return <></>;
}

HomePage.getLayout = (c) => (
  <AppLayout>
    <Head>
      {/* Script untuk Crisp Chat */}
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
          window.$crisp=[];
          window.CRISP_WEBSITE_ID="46ffdd69-59a5-4db2-bdf6-dd7f72ccafd6";
          (function(){
            d=document;
            s=d.createElement("script");
            s.src="https://client.crisp.chat/l.js";
            s.async=1;
            d.getElementsByTagName("head")[0].appendChild(s);
          })();
          `,
        }}
      ></script>
    </Head>
    {c}
  </AppLayout>
);

export default HomePage;

