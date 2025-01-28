import {
  Avatar,
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spacer,
  Stack,
  Text,
  VStack,
  Spinner,
} from '@chakra-ui/react';
import { useActiveSidebarItem, SidebarItemInfo } from '@/utils/router';
import { useGuilds, useSelfUserQuery } from '@/api/hooks';
import { SearchBar } from '@/components/forms/SearchBar';
import { useMemo, useState, useEffect } from 'react';
import { config } from '@/config/common';
import { FiSettings as SettingsIcon } from 'react-icons/fi';
import { RiVerifiedBadgeFill } from 'react-icons/ri'; // Ikon verified
import { avatarUrl } from '@/api/discord';
import { GuildItem, GuildItemsSkeleton } from './GuildItem';
import Link from 'next/link';
import { SidebarItem } from './SidebarItem';
import items from '@/config/sidebar-items';

export function SidebarContent() {
  const [filter, setFilter] = useState('');
  const guilds = useGuilds();

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
                href={`${config.inviteUrl}&guild_id=${guild.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GuildItem
                  guild={guild}
                  active={false} // Tidak ada state aktif
                  href={`${config.inviteUrl}&guild_id=${guild.id}`}
                />
              </a>
            ))
          )}
        </Flex>
      </Stack>
    </>
  );
}

export function BottomCard() {
  const user = useSelfUserQuery().data;
  const [isChecking, setIsChecking] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const apiKey = localStorage.getItem('jkt48-api-key'); // Ambil API key dari localStorage

    if (apiKey) {
      fetch(`https://api.jkt48connect.my.id/api/check-apikey/${apiKey}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.premium !== undefined) {
            setIsPremium(data.premium);
          } else {
            setIsPremium(false);
          }
        })
        .catch((err) => {
          console.error('Error checking premium status:', err);
          setIsPremium(false);
        })
        .finally(() => {
          setIsChecking(false); // Selesai pengecekan
        });
    } else {
      setIsPremium(false);
      setIsChecking(false);
    }
  }, []);

  if (user == null) return <></>;

  return (
    <Card pos="sticky" left={0} bottom={0} w="full" py={2}>
      <CardBody as={HStack}>
        <Avatar src={avatarUrl(user)} name={user.username} size="sm" />
        <Flex align="center" gap={2}>
          <Text fontWeight="600">{user.username}</Text>
          {isChecking ? (
            <Spinner size="xs" />
          ) : isPremium ? (
            <RiVerifiedBadgeFill color="#4299E1" size={16} title="Verified Premium" />
          ) : null}
        </Flex>
        <Spacer />
        <Link href="/user/profile">
          <IconButton icon={<SettingsIcon />} aria-label="settings" />
        </Link>
      </CardBody>
    </Card>
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
