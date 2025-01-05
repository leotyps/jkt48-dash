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
import { config } from '@/config/common';
import { useGuilds } from '@/api/hooks';
import HomeView from '@/config/example/HomeView';
import { NextPageWithLayout } from '@/pages/_app';
import AppLayout from '@/components/layout/app';
import { iconUrl } from '@/api/discord';
import Link from 'next/link';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const HomePage: NextPageWithLayout = () => {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/getSession'); // Endpoint untuk mendapatkan session
        console.log('Fetching session...', response); // Log response untuk debug
        if (response.ok) {
          const data = await response.json();
          console.log('Session data:', data); // Log data session untuk debug
          setSession(data); // Simpan session ke state
        } else {
          setSession(null);
          router.push('/login'); // Redirect ke login jika session tidak valid
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        router.push('/login'); // Redirect jika ada error
      } finally {
        setLoadingSession(false); // Set loading selesai setelah fetch
      }
    };

    fetchSession();
  }, [router]);

  if (loadingSession) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Text>Loading...</Text>
      </Flex>
    );
  }

  if (!session) {
    return null; // Jika tidak ada session, jangan render apa pun
  }

  return <GuildSelect />;
};

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
              <Button
                as="a"
                href={`${config.inviteUrl}&guild_id=${guild.id}`}
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
