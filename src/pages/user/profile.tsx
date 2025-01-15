import { Flex, Grid, Spacer, Text, VStack } from '@chakra-ui/layout';
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Image,
  useColorMode,
  Box,
  Input,
  useToast,
} from '@chakra-ui/react';
import { avatarUrl, bannerUrl } from '@/api/discord';
import { SelectField } from '@/components/forms/SelectField';
import { SwitchField } from '@/components/forms/SwitchField';
import { languages, names, useLang } from '@/config/translations/provider';
import { profile } from '@/config/translations/profile';
import { IoLogOut } from 'react-icons/io5';
import { useSettingsStore } from '@/stores';
import { NextPageWithLayout } from '@/pages/_app';
import AppLayout from '@/components/layout/app';
import { useLogoutMutation } from '@/utils/auth/hooks';
import { useSelfUser } from '@/api/hooks';
import { useState, useEffect } from 'react';

const ProfilePage: NextPageWithLayout = () => {
  const user = useSelfUser();
  const logout = useLogoutMutation();
  const t = profile.useTranslations();
  
  const { colorMode, setColorMode } = useColorMode();
  const { lang, setLang } = useLang();
  const [devMode, setDevMode] = useSettingsStore((s) => [s.devMode, s.setDevMode]);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    // Fetch API key from the server when the component loads
    const fetchApiKey = async () => {
      const res = await fetch('/api/auth/apiKey');
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey || '');
      } else {
        console.error('Failed to fetch API key');
      }
    };

    fetchApiKey();
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const saveApiKey = async () => {
    if (!apiKey) {
      toast({
        title: 'Error',
        description: 'API Key tidak boleh kosong!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const response = await fetch('/api/auth/apiKey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    if (response.ok) {
      setApiStatus('API Key berhasil disimpan');
      toast({
        title: 'Success',
        description: 'API Key berhasil disimpan!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan API Key.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 800px) auto' }} gap={{ base: 3, lg: 6 }}>
      <Flex direction="column">
        {user.banner != null ? (
          <Image
            alt="banner"
            src={bannerUrl(user.id, user.banner)}
            sx={{ aspectRatio: '1100 / 440' }}
            objectFit="cover"
            rounded="2xl"
          />
        ) : (
          <Box bg="Brand" rounded="2xl" sx={{ aspectRatio: '1100 / 440' }} />
        )}
        <VStack mt="-50px" ml="40px" align="start">
          <Avatar
            src={avatarUrl(user)}
            name={user.username}
            w="100px"
            h="100px"
            ringColor="CardBackground"
            ring="6px"
          />
          <Text fontWeight="600" fontSize="2xl">
            {user.username}
          </Text>
        </VStack>
      </Flex>
      <Card w="full" rounded="3xl" h="fit-content" variant="primary">
        <CardHeader fontSize="2xl" fontWeight="600">
          {t.settings}
        </CardHeader>
        <CardBody as={Flex} direction="column" gap={6} mt={3}>
          {/* Other settings... */}
          
          {/* API Key Settings */}
          <FormControl>
            <Box mb={2}>
              <FormLabel fontSize="md" fontWeight="medium" m={0}>
                JKT48Connect Apikey
              </FormLabel>
              <Text color="TextSecondary">Simpan Apikeymu disini</Text>
            </Box>
            <Input
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="Masukkan API Key JKT48"
              size="lg"
            />
            {apiStatus && <Text mt={2}>{apiStatus}</Text>}
          </FormControl>
          <Button colorScheme="teal" onClick={saveApiKey}>
            Simpan API Key
          </Button>

          <Spacer />
          <Button
            leftIcon={<IoLogOut />}
            variant="danger"
            isLoading={logout.isLoading}
            onClick={() => logout.mutate()}
          >
            {t.logout}
          </Button>
        </CardBody>
      </Card>
    </Grid>
  );
};

ProfilePage.getLayout = (p) => <AppLayout>{p}</AppLayout>;

export default ProfilePage;
