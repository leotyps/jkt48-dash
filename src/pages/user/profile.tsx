import { Grid, Flex, Spacer, Text, VStack, Box, FormControl, FormLabel, Input, Button, useToast } from '@chakra-ui/react';
import { Avatar, Image } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { IoLogOut } from 'react-icons/io5';
import { useRouter } from 'next/router';
import { profile } from '@/config/translations/profile';
import { useSelfUser } from '@/api/hooks';
import { useLogoutMutation } from '@/utils/auth/hooks';
import { useSettingsStore } from '@/stores';
import { NextPageWithLayout } from '@/pages/_app';
import AppLayout from '@/components/layout/app';

const ProfilePage: NextPageWithLayout = () => {
  const user = useSelfUser();
  const logout = useLogoutMutation();
  const t = profile.useTranslations();
  const [apiKey, setApiKey] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const toast = useToast();
  const { lang } = useLang();
  
  useEffect(() => {
    // Ambil API Key dari server setelah login
    const fetchApiKey = async () => {
      try {
        const res = await fetch(`/api/auth/getApiKey?userId=${user.id}`);
        const data = await res.json();

        if (res.ok) {
          setApiKey(data.apiKey);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error fetching API key:', error);
      }
    };

    if (user?.id) {
      fetchApiKey();
    }
  }, [user]);

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

    try {
      const res = await fetch('/api/auth/updateApiKey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, newApiKey: apiKey }),
      });

      if (res.ok) {
        setApiStatus('API Key berhasil diperbarui');
        toast({
          title: 'Success',
          description: 'API Key berhasil diperbarui!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const data = await res.json();
        console.error(data.error);
        toast({
          title: 'Error',
          description: 'Gagal memperbarui API Key',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error updating API key:', error);
    }
  };

  return (
    <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 800px) auto' }} gap={{ base: 3, lg: 6 }}>
      <Flex direction="column">
        {/* Avatar and Banner */}
        <Image src={user.banner ? user.banner : '/default-banner.jpg'} alt="Banner" />
        <VStack mt="-50px" ml="40px" align="start">
          <Avatar src={user.avatarUrl} name={user.username} size="xl" />
          <Text fontSize="2xl">{user.username}</Text>
        </VStack>
      </Flex>

      <Box w="full" rounded="3xl" p={6} boxShadow="md">
        <Text fontSize="2xl" fontWeight="bold">{t.settings}</Text>
        
        {/* API Key Section */}
        <FormControl mt={4}>
          <FormLabel>JKT48Connect API Key</FormLabel>
          <Input
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Masukkan API Key"
            size="lg"
          />
          {apiStatus && <Text mt={2}>{apiStatus}</Text>}
        </FormControl>
        
        <Button colorScheme="teal" onClick={saveApiKey} mt={4}>
          Simpan API Key
        </Button>

        <Spacer />
        
        {/* Logout Button */}
        <Button
          leftIcon={<IoLogOut />}
          colorScheme="red"
          onClick={() => logout.mutate()}
          mt={4}
        >
          {t.logout}
        </Button>
      </Box>
    </Grid>
  );
};

ProfilePage.getLayout = (p) => <AppLayout>{p}</AppLayout>;

export default ProfilePage;
