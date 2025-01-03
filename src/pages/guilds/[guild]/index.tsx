import { Center, Flex, Heading, SimpleGrid, Text, Button, Icon } from '@chakra-ui/react';
import { LoadingPanel } from '@/components/panel/LoadingPanel';
import { QueryStatus } from '@/components/panel/QueryPanel';
import { config } from '@/config/common';
import { guild as view } from '@/config/translations/guild';
import { BsMailbox } from 'react-icons/bs';
import { FaRobot } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { getFeatures } from '@/utils/common';
import { Banner } from '@/components/GuildBanner';
import { FeatureItem } from '@/components/feature/FeatureItem';
import type { CustomGuildInfo } from '@/config/types/custom-types';
import { NextPageWithLayout } from '@/pages/_app';
import getGuildLayout from '@/components/layout/guild/get-guild-layout';

const GuildPage: NextPageWithLayout = () => {
  const t = view.useTranslations();
  const router = useRouter();
  const guild = router.query.guild as string;

  // Hook tetap dipanggil meskipun parameter guild mungkin belum valid
  const query = useGuildInfoQuery(guild);

  // Jika parameter guild belum ada, tampilkan pesan error
  if (!guild) {
    return (
      <Center h="100vh">
        <Text fontSize="xl" fontWeight="bold" color="red.500">
          {t.error['invalid guild']}
        </Text>
      </Center>
    );
  }

  return (
    <QueryStatus query={query} loading={<LoadingPanel />} error={t.error['failed to load guild']}>
      {query.data ? <GuildPanel guild={guild} info={query.data} /> : <NotJoined guild={guild} />}
    </QueryStatus>
  );
};

function GuildPanel({ guild: id, info }: { guild: string; info: CustomGuildInfo }) {
  const t = view.useTranslations();

  return (
    <Flex direction="column" gap={5}>
      <Banner />
      <Flex direction="column" gap={5} mt={3}>
        <Heading size="md">{t.features}</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, '2xl': 3 }} gap={3}>
          {getFeatures().map((feature) => (
            <FeatureItem
              key={feature.id}
              guild={id}
              feature={feature}
              enabled={info.enabledFeatures.includes(feature.id)}
            />
          ))}
        </SimpleGrid>
      </Flex>
    </Flex>
  );
}

function NotJoined({ guild }: { guild: string }) {
  const t = view.useTranslations();

  return (
    <Center flexDirection="column" gap={3} h="full" p={5}>
      <Icon as={BsMailbox} w={50} h={50} />
      <Text fontSize="xl" fontWeight="600">
        {t.error['not found']}
      </Text>
      <Text textAlign="center" color="TextSecondary">
        {t.error['not found description']}
      </Text>
      <Button
        variant="action"
        leftIcon={<FaRobot />}
        px={6}
        as="a"
        href={`${config.inviteUrl}&guild_id=${guild}`}
        target="_blank"
      >
        {t.bn.invite}
      </Button>
    </Center>
  );
}

GuildPage.getLayout = (c) => getGuildLayout({ children: c });
export default GuildPage;

// Hook untuk fetching data guild
export const useGuildInfoQuery = (guild?: string) => {
  return useQuery(
    ['guildInfo', guild],
    async () => {
      if (!guild) throw new Error('Guild ID is required');
      const response = await fetch(`/api/guilds/${guild}`);
      if (!response.ok) throw new Error('Failed to fetch guild data');
      return response.json();
    },
    {
      enabled: !!guild, // Hanya fetch jika guild tersedia
    }
  );
};
