import { useState, useEffect } from 'react';
import { Flex, Grid, Spacer, Text, VStack, Box } from '@chakra-ui/layout';
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
  Input,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { IoLogOut } from 'react-icons/io5';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useLogoutMutation } from '@/utils/auth/hooks';
import { useSelfUser } from '@/api/hooks';
import { profile } from '@/config/translations/profile';
import { avatarUrl, bannerUrl } from '@/api/discord';
import { SelectField } from '@/components/forms/SelectField';
import { SwitchField } from '@/components/forms/SwitchField';
import { languages, useLang } from '@/config/translations/provider';
import { useSettingsStore } from '@/stores';
import AppLayout from '@/components/layout/app';
import { NextPageWithLayout } from '@/pages/_app';
import { auth } from '@/config/firebaseConfig'; // Firebase config
import { BiCheckCircle } from 'react-icons/bi'; // Ikon dari React Icons


const names = {
  en: "English",
  fr: "French",
  cn: "Chindo Rek",
  // Add other language names here
};

/**
 * User info and general settings here
 */
const ProfilePage: NextPageWithLayout = () => {
 const user = useSelfUser();
  const logout = useLogoutMutation();
  const t = profile.useTranslations();

  const { colorMode, setColorMode } = useColorMode();
  const { lang, setLang } = useLang();
  //const { user, isLoading, isError } = useSelfUser();
  const [devMode, setDevMode] = useSettingsStore((s) => [s.devMode, s.setDevMode]);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [linkedGmail, setLinkedGmail] = useState<boolean>(false);
  const [linkedEmail, setLinkedEmail] = useState<string | null>(null);
  const toast = useToast();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
const [isChecking, setIsChecking] = useState<boolean>(true); // State untuk cek API status


  useEffect(() => {
  // Check if the user has linked their Gmail account
  const storedEmail = localStorage.getItem('linked-gmail-email');
  if (storedEmail) {
    setLinkedGmail(true);
    setLinkedEmail(storedEmail);
  }

  // Check if ts-apikey cookie exists and set it to localStorage
  const apiKeyFromCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('ts-apikey='))
    ?.split('=')[1];
  if (apiKeyFromCookie) {
    localStorage.setItem('jkt48-api-key', apiKeyFromCookie);
    setApiKey(apiKeyFromCookie);
  } else {
    const storedApiKey = localStorage.getItem('jkt48-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }
}, []);

type User = {
  id: string;
  username: string;
  // tambahkan properti lain yang Anda perlukan dari user
};



function initializeApiKeyAndSaveUserData(user: User) {
  if (typeof window !== 'undefined') {
    const existingKey = localStorage.getItem('jkt48-api-key');

    // Buat parameter query dari data user
    const userData = new URLSearchParams({
      id: user.id,
      username: user.username,
      balance: '0', // Misalnya saldo awal adalah 0
    });

    if (!existingKey) {
      fetch(`/api/auth/get-api-key?${userData.toString()}`)
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
}

useEffect(() => {
  // Pastikan user sudah tersedia sebelum memanggil fungsi
  if (user) {
    initializeApiKeyAndSaveUserData(user);
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
    // Simpan API Key ke localStorage
    localStorage.setItem('jkt48-api-key', apiKey);

    // Kirim permintaan untuk mengedit API Key pada server
    const response = await fetch(`/api/auth/edit-user-data?id=${user.id}&apiKey=${apiKey}`, {
      method: 'GET',
    });

    if (response.ok) {
      setApiStatus('API Key berhasil disimpan');
      toast({
        title: 'Success',
        description: 'API Key berhasil disimpan dan diperbarui di server!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      const errorData = await response.json();
      toast({
        title: 'Error',
        description: errorData.error || 'Gagal memperbarui API Key di server!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  } catch (error) {
    console.error('Error saving API Key:', error);
    toast({
      title: 'Error',
      description: 'Terjadi kesalahan saat menyimpan API Key.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }
};

const linkGmailAccount = async () => {
  const provider = new GoogleAuthProvider();
  try {
    // Trigger the Google sign-in popup
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Handle the case where email might be null
    const email = user.email || 'Email tidak ditemukan';

    // Store the Gmail email in localStorage and set linked status
    localStorage.setItem('linked-gmail', 'true');
    localStorage.setItem('linked-gmail-email', email);
    setLinkedGmail(true);
    setLinkedEmail(email);

    toast({
      title: 'Gmail Linked',
      description: email === 'Email tidak ditemukan'
        ? 'Gmail berhasil ditautkan, tetapi email tidak dapat ditemukan.'
        : `Gmail berhasil ditautkan (${email}).`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // Optionally, store user's Gmail in the user database on the server
    await fetch('/api/auth/linkGmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  } catch (error) {
    console.error('Error linking Gmail:', error);
    toast({
      title: 'Error',
      description: 'Failed to link Gmail account.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }
};

  return (
    <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 800px) auto' }} gap={{ base: 3, lg: 6 }}>
      <Flex direction="column">
          <Image
            alt="banner"
            src="https://8030.us.kg/file/axcJhu4yIENp.jpg"
            sx={{ aspectRatio: '1100 / 440' }}
            objectFit="cover"
            rounded="2xl"
          />
        
        <VStack mt="-50px" ml="40px" align="start">
  <Avatar
    src={avatarUrl(user)}
    name={user.username}
    w="100px"
    h="100px"
    ringColor="CardBackground"
    ring="6px"
  />
  <Text fontWeight="600" fontSize="2xl" display="flex" alignItems="center">
    {user.username}
    {isChecking ? (
      <Spinner ml={2} size="sm" />
    ) : (
      <Box as="span" ml={2}>
        <BiCheckCircle
          size={20} // Ukuran ikon
          color={isPremium ? '#4299E1' : '#A0AEC0'} // Warna biru untuk premium, abu-abu untuk non-premium
          title={isPremium ? 'Verified Premium' : 'Not Premium'} // Tooltip untuk informasi
        />
      </Box>
    )}
  </Text>
</VStack>
      </Flex>
      <Card w="full" rounded="3xl" h="fit-content" variant="primary">
        <CardHeader fontSize="2xl" fontWeight="600">
          {t.settings}
        </CardHeader>
        <CardBody as={Flex} direction="column" gap={6} mt={3}>
          <SwitchField
            id="dark-mode"
            label={t['dark mode']}
            desc={t['dark mode description']}
            isChecked={colorMode === 'dark'}
            onChange={(e) => setColorMode(e.target.checked ? 'dark' : 'light')}
          />
          <SwitchField
            id="developer-mode"
            label={t['dev mode']}
            desc={t['dev mode description']}
            isChecked={devMode}
            onChange={(e) => setDevMode(e.target.checked)}
          />
          <FormControl>
            <Box mb={2}>
              <FormLabel fontSize="md" fontWeight="medium" m={0}>
                {t.language}
              </FormLabel>
              <Text color="TextSecondary">{t['language description']}</Text>
            </Box>
            <SelectField
              value={{
                label: names[lang],
                value: lang,
              }}
              onChange={(e) => e != null && setLang(e.value)}
              options={languages.map((lang) => ({
                label: lang.name,
                value: lang.key,
              }))}
            />
          </FormControl>

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

          {/* Gmail Settings */}
          <FormControl>
  <Box mb={2}>
    <FormLabel fontSize="md" fontWeight="medium" m={0}>
      Linked Gmail Account
    </FormLabel>
    {linkedGmail && linkedEmail ? (
      <Text color="green.500">
        Linked Email: {linkedEmail === 'Email tidak ditemukan' 
          ? 'Email tidak dapat ditemukan' 
          : linkedEmail}
      </Text>
    ) : (
      <Text color="red.500">No Gmail account linked.</Text>
    )}
  </Box>
  <Button
    colorScheme="blue"
    onClick={linkGmailAccount}
  >
    {linkedGmail ? 'Link Another Gmail Account' : 'Link Gmail Account'}
  </Button>
</FormControl>

        </CardBody>
      </Card>
    </Grid>
  );
};

ProfilePage.getLayout = (p) => <AppLayout>{p}</AppLayout>;

export default ProfilePage;
