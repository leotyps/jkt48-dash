import {
  Avatar,
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useActiveSidebarItem, SidebarItemInfo } from '@/utils/router';
import { useGuilds, useSelfUserQuery } from '@/api/hooks';
import { SearchBar } from '@/components/forms/SearchBar';
import { useMemo, useState } from 'react';
import { config } from '@/config/common';
import { avatarUrl } from '@/api/discord';
import { GuildItem, GuildItemsSkeleton } from './GuildItem';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SidebarItem } from './SidebarItem';
import items from '@/config/sidebar-items';

export function SidebarContent() {
  const [filter, setFilter] = useState('');
  const guilds = useGuilds();
  const { guild: selectedGroup } = useRouter().query as {
    guild: string;
  };

  const filteredGuilds = useMemo(
    () =>
      guilds.data?.filter((guild) => {
        const contains = guild.name.toLowerCase().includes(filter.toLowerCase());

        return config.guild.filter(guild) && contains;
      }),
    [guilds.data, filter]
  );

  return (
    <>
      <VStack align="center" py="2rem" m={3} bg="Brand" rounded="xl">
        <Heading size="lg" fontWeight={600} color="white">
          {config.name}
        </Heading>
      </VStack>

      <Stack direction="column" mb="auto">
        <Items />
        <Box px="10px">
          <SearchBar
            w="full"
            input={{
              value: filter,
              onChange: (e) => setFilter(e.target.value),
            }}
          />
        </Box>
        <Flex direction="column" px="10px" gap={3}>
          {filteredGuilds == null ? (
            <GuildItemsSkeleton />
          ) : (
            filteredGuilds?.map((guild) => (
              <a
                key={guild.id}
                href={`${config.inviteUrl}&guild_id=${guild.id}`} // URL invite bot
                target="_blank"
                rel="noopener noreferrer"
              >
                <GuildItem
                  guild={guild}
                  active={false} // Tidak ada state aktif
                />
              </a>
            ))
          )}
        </Flex>
      </Stack>

      {/* Tambahkan Menu Official Website */}
      <Box px="10px" mt="4">
        <a
          href="https://www.jkt48connect.my.id"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Flex
            align="center"
            bg="blue.600"
            px="4"
            py="2"
            borderRadius="md"
            _hover={{ bg: 'blue.500' }}
          >
            <Avatar
              size="sm"
              bg="blue.400"
              icon={<Text fontWeight="bold" color="white">J</Text>}
            />
            <Text ml="3" color="white" fontWeight="bold">
              Official Website JKT48Connect
            </Text>
          </Flex>
        </a>
      </Box>
    </>
  );
}

export function BottomCard() {
  const user = useSelfUserQuery().data;
  if (user == null) return <></>;

  return (
    <Box pos="sticky" left={0} bottom={0} w="full" py={2}>
      <Flex align="center" px="4">
        <Avatar src={avatarUrl(user)} name={user.username} size="sm" />
        <Text fontWeight="600" ml="3">
          {user.username}
        </Text>
        <Spacer />
        <Link href="/user/profile">
          <Text color="blue.500" fontWeight="bold" cursor="pointer">
            Profile
          </Text>
        </Link>
      </Flex>
    </Box>
  );
}

function Items() {
  const active = useActiveSidebarItem();

  return (
    <Flex direction="column" px="10px" gap={0}>
      {items
        .filter((item) => !item.hidden)
        .map((route: SidebarItemInfo, index: number) => (
          <SidebarItem
            key={index}
            href={route.path}
            name={route.name}
            icon={route.icon}
            active={active === route}
          />
        ))}
    </Flex>
  );
}
