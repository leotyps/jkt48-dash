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
import { useLogoutMutation } from '@/utils/auth/hooks';
import { useSelfUser } from '@/api/hooks';
import { profile } from '@/config/translations/profile';
import { SelectField } from '@/components/forms/SelectField';
import { SwitchField } from '@/components/forms/SwitchField';
import { languages, useLang } from '@/config/translations/provider';
import { useSettingsStore } from '@/stores';
import AppLayout from '@/components/layout/app';
import { NextPageWithLayout } from '@/pages/_app';
import { RiVerifiedBadgeFill } from 'react-icons/ri';

const ProfilePage: NextPageWithLayout = () => {
  const user = useSelfUser();
  const logout = useLogoutMutation();
  const t = profile.useTranslations();
  const { colorMode, setColorMode } = useColorMode();
  const { lang, setLang } = useLang();
  const [devMode, setDevMode] = useSettingsStore((s) => [s.devMode, s.setDevMode]);
  const toast = useToast();
  
  // State untuk OTP dan nomor WhatsApp
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Fungsi untuk mengirim OTP
  const sendOtp = async () => {
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
      const response = await fetch(`/api/otp?phone=${phoneNumber}`, { method: 'POST' });

      if (response.ok) {
        setIsOtpSent(true);
        toast({
          title: 'OTP Sent',
          description: 'Kode OTP telah dikirim ke WhatsApp Anda!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Gagal mengirim OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengirim OTP. Coba lagi!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fungsi untuk verifikasi OTP dan menyimpan nomor
  const verifyOtpAndSave = async () => {
    if (!otpCode) {
      toast({
        title: 'Error',
        description: 'Masukkan kode OTP!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`/api/auth/edit-phone-number?id=${user.id}&phoneNumber=${phoneNumber}`, {
        method: 'GET',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Nomor WhatsApp berhasil diverifikasi dan disimpan!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setIsOtpSent(false);
        setOtpCode('');
      } else {
        throw new Error('Gagal menyimpan nomor WhatsApp');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan nomor WhatsApp!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsVerifying(false);
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
          <Avatar name={user.username} w="100px" h="100px" ringColor="CardBackground" ring="6px" />
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
                Nomor WhatsApp
              </FormLabel>
              <Text color="TextSecondary">Simpan nomor WhatsAppmu disini</Text>
            </Box>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Masukkan Nomor WhatsApp"
              size="lg"
              isDisabled={isOtpSent}
            />
            <Button colorScheme="teal" mt={2} onClick={sendOtp} isDisabled={isOtpSent}>
              Kirim OTP
            </Button>

            {isOtpSent && (
              <>
                <Input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Masukkan Kode OTP"
                  size="lg"
                  mt={4}
                />
                <Button colorScheme="green" mt={2} onClick={verifyOtpAndSave} isLoading={isVerifying}>
                  Verifikasi OTP & Simpan Nomor
                </Button>
              </>
            )}
          </FormControl>
        </CardBody>
      </Card>
    </Grid>
  );
};

ProfilePage.getLayout = (p) => <AppLayout>{p}</AppLayout>;

export default ProfilePage;
