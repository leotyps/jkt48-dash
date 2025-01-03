import {
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

const HomePage: NextPageWithLayout = () => {
  //used for example only, you should remove it
  return <HomeView />;

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
            <Card
              key={guild.id}
              variant="primary"
              as="a"
              href={`${config.inviteUrl}&guild_id=${guild.id}`} // URL invite bot
              target="_blank"
              _hover={{ transform: 'scale(1.03)', transition: '0.2s' }} // Animasi hover
            >
              <CardHeader as={Flex} flexDirection="row" gap={3} alignItems="center">
                <Avatar src={iconUrl(guild)} name={guild.name} size="md" />
                <Text fontWeight="bold" fontSize="lg" isTruncated>
                  {guild.name}
                </Text>
              </CardHeader>
            </Card>
          ))}
      </SimpleGrid>
    );

  if (guilds.status === 'error')
    return (
      <Text color="red.500" fontWeight="bold">
        Failed to load guilds. Please try again.
      </Text>
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

HomePage.getLayout = (c) => <AppLayout>{c}</AppLayout>;
export default HomePage;
