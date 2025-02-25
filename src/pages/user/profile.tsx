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
import { avatarUrl } from '@/api/discord';
import { SelectField } from '@/components/forms/SelectField';
import { SwitchField } from '@/components/forms/SwitchField';
import { languages, useLang } from '@/config/translations/provider';
import { useSettingsStore } from '@/stores';
import AppLayout from '@/components/layout/app';
import { NextPageWithLayout } from '@/pages/_app';
import { auth } from '@/config/firebaseConfig'; 
import { RiVerifiedBadgeFill } from 'react-icons/ri';

const names = {
  en: "English",
  fr: "French",
  cn: "Chindo Rek",
};

const ProfilePage: NextPageWithLayout = () => {
  const user = useSelfUser();
  const logout = useLogoutMutation();
  const t = profile.useTranslations();
  const { colorMode, setColorMode } = useColorMode();
  const { lang, setLang } = useLang();
  const [devMode, setDevMode] = useSettingsStore((s) => [s.devMode, s.setDevMode]);
  const [apiKey, setApiKey] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [linkedGmail, setLinkedGmail] = useState<boolean>(false);
  const [linkedEmail, setLinkedEmail] = useState<string | null>(null);
  const toast = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [showOtpField, setShowOtpField] = useState(false);

  const requestOtp = async () => {
    if (!phoneNumber) {
      toast({
        title: 'Error',
        description: 'Nomor WhatsApp tidak boleh kosong!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`/api/otp?phone=${phoneNumber}`, {
        method: 'POST',
      });

      if (response.ok) {
        setShowOtpField(true);
        toast({
          title: 'OTP Sent',
          description: 'Kode OTP telah dikirim ke nomor WhatsApp Anda.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.error || 'Gagal mengirim OTP!',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengirim OTP.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const verifyOtpAndSaveNumber = async () => {
    if (!otp || !phoneNumber) {
      toast({
        title: 'Error',
        description: 'OTP tidak boleh kosong!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`/api/otp`, {
        method: 'GET',
      });

      if (!response.ok) {
        toast({
          title: 'Error',
          description: 'Gagal mengambil data OTP!',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const data = await response.json();
      const matchingOtp = data.find((entry: any) => entry.phone === phoneNumber && entry.otp === otp);

      if (matchingOtp) {
        await fetch(`/api/auth/edit-phone-number?id=${user.id}&phoneNumber=${phoneNumber}`, {
          method: 'GET',
        });

        toast({
          title: 'Success',
          description: 'Nomor WhatsApp berhasil diverifikasi dan disimpan!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });

        setShowOtpField(false);
      } else {
        toast({
          title: 'Error',
          description: 'OTP tidak valid!',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat memverifikasi OTP.',
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
          src="https://8030.us.kg/file/3gjp59rB7bs8.jpg"
          sx={{ aspectRatio: '1100 / 440' }}
          objectFit="cover"
          rounded="2xl"
        />
        <VStack mt="-50px" ml="40px" align="start">
          <Avatar src={avatarUrl(user)} name={user.username} w="100px" h="100px" />
          <Text fontWeight="600" fontSize="2xl" display="flex" alignItems="center">
            {user.username}
            {isChecking ? (
              <Spinner ml={2} size="sm" />
            ) : (
              <Box as="span" ml={2}>
                <RiVerifiedBadgeFill size={20} color={isPremium ? '#4299E1' : '#A0AEC0'} />
              </Box>
            )}
          </Text>
        </VStack>
      </Flex>

      <Card w="full" rounded="3xl">
        <CardHeader fontSize="2xl" fontWeight="600">Settings</CardHeader>
        <CardBody as={Flex} direction="column" gap={6} mt={3}>

          <FormControl>
            <FormLabel>Nomor WhatsApp</FormLabel>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Masukkan Nomor WhatsApp"
            />
          </FormControl>
          <Button colorScheme="blue" onClick={requestOtp}>Kirim OTP</Button>

          {showOtpField && (
            <FormControl>
              <FormLabel>Masukkan OTP</FormLabel>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Masukkan kode OTP"
              />
              <Button mt={2} colorScheme="green" onClick={verifyOtpAndSaveNumber}>Verifikasi OTP</Button>
            </FormControl>
          )}
        </CardBody>
      </Card>
    </Grid>
  );
};

ProfilePage.getLayout = (p) => <AppLayout>{p}</AppLayout>;
export default ProfilePage;
