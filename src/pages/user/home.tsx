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
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppLayout from '@/components/layout/app';
import Head from 'next/head';
import { ReactNode } from 'react'; // Tambahkan import ini



const HomePage = () => {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/getSession');
        if (response.ok) {
          const data = await response.json();
          setSession(data);
        } else {
          setSession(null);
          router.push('/login'); // Redirect jika session tidak valid
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        router.push('/login'); // Redirect jika error
      } finally {
        setLoadingSession(false);
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
    return null; // Tidak render apa pun jika tidak ada session
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
                <Avatar src={guild.icon} name={guild.name} size="md" />
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

HomePage.getLayout = (c: ReactNode) => (
  <AppLayout>
    <Head>
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
